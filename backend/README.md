# API de Produtos

Projeto em JavaScript, Fastify 5, Zod 3 e PostgreSQL 16. As entidades do banco seguem o diagrama UML enviado pelo grupo. A descrição das rotas fica em `http://localhost:3001/docs`.

## Começar

Na pasta `product-backend`, execute:

```sh
docker compose up --build
```

Isso cria os contêineres do PostgreSQL e da API. O banco fica em `localhost:5434`; a API, em `localhost:3001`. O arquivo `docker/postgres/init.sql` cria as tabelas no volume novo `dados_postgres_uml`.

Para rodar apenas o backend fora do Docker, configure `DATABASE_URL` no `.env` e use `npm ci` e `npm start`. O arquivo `.env.example` mostra as variáveis disponíveis.

## Entidades do banco

| Tabela | Relação principal |
|---|---|
| `categoria` | Pode ter uma categoria pai e vários produtos |
| `unidade_medida` | Pode ser usada por vários produtos |
| `produto` | Pertence a uma categoria e a uma unidade de medida |
| `produto_preco_historico` | Guarda as vigências de preço de um produto; `usuario_id` pode ser nulo |
| `usuario` | Cadastro e login simples; pode ser relacionado a registros de histórico |

Os campos, tamanhos e tipos dessas tabelas estão em [docker/postgres/init.sql](docker/postgres/init.sql). `produto.preco` usa `numeric(10,2)` e `produto.estoque` usa `numeric(10,3)`. O estoque é armazenado em `produto`, conforme o diagrama. O modelo atual não tem os campos `custo`, `ean13` ou uma tabela de fornecedores.

**Dados anteriores:** o volume usado pelo modelo antigo não é alterado. Para aproveitar dados antigos no novo esquema, é necessária uma migração específica. O PostgreSQL não executa `init.sql` de novo em um volume já preenchido.

## Como o código está organizado

O backend segue três camadas simples, cada uma com uma única responsabilidade:

- `src/models/`: as **Entidades** (Produto, Categoria, UnidadeMedida, HistoricoPreco). Descrevem os campos de cada tabela e como viram JSON na resposta da API. Não sabem nada sobre HTTP nem sobre SQL.
- `src/repositories/`: os **Repositories**. É a única camada que escreve SQL — uma classe por tabela (`ProdutoRepository`, `CategoriaRepository`, `UnidadeMedidaRepository`, `HistoricoPrecoRepository`). Controllers nunca acessam o banco diretamente.
- `src/controllers/`: os **Controllers**. Recebem a requisição HTTP, chamam os Repositories na ordem certa e aplicam as regras de negócio (ex.: não deixar excluir categoria com produto ativo), e devolvem a resposta.
- `src/database/`: a conexão com o banco.
  - `DatabaseConnection.js` é uma **classe abstrata**: define os métodos que qualquer banco precisa ter (`query`, `obterCliente`, `transacao`, `encerrar`), mas não sabe implementá-los.
  - `PostgresConnection.js` implementa esses métodos usando PostgreSQL — é a única peça do projeto que "sabe" que o banco é o Postgres.
  - `index.js` exporta a instância única (`db`) usada por todos os repositories. **Para trocar de banco de dados no futuro**, basta criar uma nova classe (ex.: `MySqlConnection.js`) que estenda `DatabaseConnection` e trocar essa instância — nenhum Model, Repository ou Controller precisa mudar.
- `src/config/env.js`: único lugar do projeto que lê `process.env`. Nenhuma senha, chave ou endereço de banco fica escrito no código — tudo vem do `.env` (veja `.env.example`).
- `src/schemas/`: valida os dados recebidos (Zod) antes de qualquer acesso ao banco.
- `src/auth.js`: confere a chave de API (`Authorization: Bearer ...`) e o perfil (operador/gestor).
- `src/http.js`: `ApiError` (erros HTTP padronizados) e `idDaRota` (valida o `:id` da URL).
- `src/app.js`: configura Fastify, documentação (`/docs`) e tratamento de erros.

Ao mudar um preço, a API fecha `vigencia_fim` do registro anterior e insere a nova vigência na **mesma transação** que altera `produto.preco`. No cadastro, ela cria a primeira vigência. `usuario_id` é opcional e, se informado, deve apontar para um registro existente em `usuario` (cadastrado via `POST /api/usuarios`).

## Rotas principais

| Método | Rota | O que faz |
|---|---|---|
| POST | `/api/produtos` | Cadastra produto e preço inicial |
| GET | `/api/produtos` | Lista com `pagina`, `limite`, `nome`, `sku`, `categoria_id` e `situacao` |
| POST | `/api/produtos/lote` | Consulta até 100 IDs em `{ "ids": [1, 2] }` |
| GET | `/api/produtos/:id` | Consulta um produto |
| PUT | `/api/produtos/:id` | Altera campos, exceto SKU |
| DELETE | `/api/produtos/:id` | Inativa sem excluir do banco |
| POST | `/api/produtos/:id/reativar` | Reativa |
| GET | `/api/produtos/:id/historico-precos` | Mostra as vigências de preço |
| POST, GET | `/api/categorias` | Cadastra e lista categorias |
| PUT, DELETE | `/api/categorias/:id` | Altera e inativa categoria |
| POST, GET | `/api/unidades-medida` | Cadastra e lista unidades |
| POST | `/api/usuarios` | Cadastra usuário (nome, email, senha) |
| POST | `/api/usuarios/login` | Login por email e senha; devolve o usuário (com o id) |
| GET | `/health` | Verifica API e banco |

Crie uma categoria e uma unidade antes do primeiro produto. Exemplo de corpo para `POST /api/produtos`:

```json
{
  "sku": "CL0001",
  "nome": "Celular 1",
  "categoria_id": 1,
  "unidade_medida_id": 1,
  "preco": 800.00,
  "estoque": 2.500
}
```

Em `PUT /api/produtos/:id`, envie somente os campos a mudar. Para uma mudança de preço, você pode incluir `motivo` e `usuario_id` no corpo; eles pertencem ao registro de histórico, não à tabela `produto`.

## Permissões e erros

Consultas de produto, categoria e unidade são públicas. Escritas exigem `Authorization: Bearer <chave>`. Configure `OPERADOR_API_KEY` e `GESTOR_API_KEY`. O operador cadastra e altera dados; o gestor também muda preços, inativa e reativa. O PDF ainda não define um sistema de autenticação de usuários, por isso as chaves de API são provisórias.

**Cadastro e login de usuário (`/api/usuarios`, `/api/usuarios/login`)** são uma verificação simples, independente das chaves acima: não usam hash de senha (bcrypt) nem token de acesso (JWT). O cadastro grava a senha como veio; o login apenas confere `email` + `senha` e devolve o usuário (com o `id`), que pode ser usado no campo opcional `usuario_id` do histórico de preço. Essas rotas **não são exigidas** para cadastrar produto, categoria ou unidade — continuam liberadas só pela chave de API.

Erros seguem `{ "erro": "...", "codigo": "...", "detalhes": [] }`. Dados inválidos retornam 422; ID inválido, 400; SKU duplicado, 409; produto inexistente, 404.

## Testes

```sh
npm test
```

Os testes usam a API sem servidor externo e verificam validação, permissões, rotas e transações de preço. Um teste de integração com PostgreSQL requer o banco disponível.
