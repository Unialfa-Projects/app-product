# API de Produtos

Projeto em JavaScript, Fastify 5, Zod 3 e PostgreSQL 16. As entidades do banco seguem o diagrama UML enviado pelo grupo. A descrição das rotas fica em `http://localhost:3000/docs`.

## Começar

Na pasta `product-backend`, execute:

```sh
docker compose up --build
```

Isso cria os contêineres do PostgreSQL e da API. O banco fica em `localhost:5433`; a API, em `localhost:3000`. O arquivo `docker/postgres/init.sql` cria as tabelas no volume novo `dados_postgres_uml`.

Para rodar apenas o backend fora do Docker, configure `DATABASE_URL` no `.env` e use `npm ci` e `npm start`. O arquivo `.env.example` mostra as variáveis disponíveis.

## Entidades do banco

| Tabela | Relação principal |
|---|---|
| `categoria` | Pode ter uma categoria pai e vários produtos |
| `unidade_medida` | Pode ser usada por vários produtos |
| `produto` | Pertence a uma categoria e a uma unidade de medida |
| `produto_preco_historico` | Guarda as vigências de preço de um produto; `usuario_id` pode ser nulo |
| `usuario` | Pode ser relacionado a registros de histórico |

Os campos, tamanhos e tipos dessas tabelas estão em [docker/postgres/init.sql](docker/postgres/init.sql). `produto.preco` usa `numeric(10,2)` e `produto.estoque` usa `numeric(10,3)`. O estoque é armazenado em `produto`, conforme o diagrama. O modelo atual não tem os campos `custo`, `ean13` ou uma tabela de fornecedores.

**Dados anteriores:** o volume usado pelo modelo antigo não é alterado. Para aproveitar dados antigos no novo esquema, é necessária uma migração específica. O PostgreSQL não executa `init.sql` de novo em um volume já preenchido.

## Como o código está organizado

- `src/schemas/`: valida os dados recebidos antes de consultar o banco.
- `src/controller/`: define as rotas e as consultas SQL de produtos e catálogo.
- `src/db.js`: cria a conexão e contém a função `transacao`, que confirma ou desfaz uma operação completa.
- `src/http.js`: padroniza respostas e erros da API.
- `src/app.js`: configura Fastify, documentação e tratamento de erros.

Ao mudar um preço, a API fecha `vigencia_fim` do registro anterior e insere a nova vigência na **mesma transação** que altera `produto.preco`. No cadastro, ela cria a primeira vigência. `usuario_id` é opcional e deve apontar para um registro existente em `usuario`; este projeto não implementa cadastro ou login de usuários. O campo `senha varchar(50)` segue a UML e não é usado pela autenticação atual.

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

Erros seguem `{ "erro": "...", "codigo": "...", "detalhes": [] }`. Dados inválidos retornam 422; ID inválido, 400; SKU duplicado, 409; produto inexistente, 404.

## Testes

```sh
npm test
```

Os testes usam a API sem servidor externo e verificam validação, permissões, rotas e transações de preço. Um teste de integração com PostgreSQL requer o banco disponível.
