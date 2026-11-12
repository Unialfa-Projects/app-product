# Módulo Produtos

Cadastro central de produtos para um e-commerce de variedades: produtos, categorias (com subcategorias), unidades de medida, histórico de preço e autenticação simples por e-mail/senha.

Stack: **Node.js 22 + Fastify 5 + PostgreSQL 16** (API) e **Vue 3 + Vite** (front-end), com SQL explícito via `pg` (sem ORM) e validação única via **Zod** compartilhada entre back-end e formulários.

## Subir com Docker

Pré-requisito: Docker Desktop instalado e em execução.

```bash
docker compose up -d --build
```

Isso sobe, nesta ordem: banco PostgreSQL → migrations + seed (serviço `migrate`, roda uma vez e finaliza) → API → front-end (Nginx servindo o build do Vite).

| Serviço | URL |
|---|---|
| Front-end | http://localhost:8080 |
| API | http://localhost:3000 |
| Documentação OpenAPI | http://localhost:3000/api/docs |
| PostgreSQL (acesso externo, ex. psql/DBeaver) | localhost:5433 |

**Usuário de demonstração:** `demo@sige.com.br` / `demo1234`

Para popular o catálogo com 5.000 produtos sintéticos (usados para validar tempo de listagem/consulta):

```bash
docker compose run --rm migrate node ../database/seed/massa-5000.js
```

Para parar tudo: `docker compose down` (adicione `-v` para apagar também os dados do banco).

As portas publicadas no host podem ser trocadas copiando `.env.example` para `.env` na raiz.

## Rodando localmente sem Docker (apenas o banco em container)

```bash
# 1. Banco de dados
docker compose -f database/docker-compose.yml up -d

# 2. Backend
cd backend
cp .env.example .env   # ajuste DATABASE_URL se mudou a porta do Postgres
npm install
npm run db:migrate
npm run db:seed
npm run db:massa        # opcional: 5.000 produtos de teste
npm run dev              # http://localhost:3000

# 3. Frontend (em outro terminal)
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

> O `database/docker-compose.yml` publica o Postgres na porta **5433** do host (não 5432), porque é comum já existir um PostgreSQL nativo ocupando a 5432 no Windows/Mac. O backend já aponta para 5433 em `.env.example`.

## Documentação

Os documentos do projeto ficam em [`docs/`](docs/):

| Documento | Conteúdo |
|---|---|
| [Documentação e Levantamento de Requisitos](docs/Documenta%C3%A7%C3%A3o%20e%20Levantamento%20de%20Requisitos.pdf) | Requisitos funcionais e não funcionais, regras de negócio e escopo do módulo |
| [Documento de UX/UI — Produtos](docs/Documento-UXUI-Produtos.pdf) | Decisões de interface, fluxos de navegação e padrões visuais das telas |
| [Documentação de Testes](docs/Documenta%C3%A7%C3%A3o%20de%20testes.pdf) | Plano e casos de teste do módulo |

Material complementar:

- **API (OpenAPI 3 / Swagger UI)**: http://localhost:3000/api/docs, com a API rodando — gerada a partir das rotas, com os schemas em [backend/src/docs/openapi.js](backend/src/docs/openapi.js).
- **Wireframes**: [`desing-wireframe-produto/`](desing-wireframe-produto/), com as telas de listagem, cadastro e visualização em quatro resoluções (1440, 1280, 884 e 412 px).
- **Exemplos de payload JSON**: [`backend/jsonExample/`](backend/jsonExample/).

## Estrutura do projeto

```
app-product/
├── docker-compose.yml          # Orquestra banco, migrate, API e front-end
├── .env.example                # Portas publicadas no host
├── package.json                # Dependências (pg, zod) resolvidas pelo shared/
│
├── backend/                    # API Node.js 22 + Fastify 5
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json            # Scripts: dev, start, db:migrate, db:seed, db:massa, db:reset
│   ├── jsonExample/            # Exemplos de payload por entidade
│   ├── test/                   # Testes da API
│   └── src/
│       ├── server.js           # Ponto de entrada: plugins, Swagger e registro das rotas
│       ├── config/             # Variáveis de ambiente (env.js) e pool do Postgres (db.js)
│       ├── rotas/              # Endpoints HTTP: auth, produtos, categorias, unidades, health
│       ├── servicos/           # Regras de negócio (produtos, preços, categorias, unidades, auth)
│       ├── repositorios/       # Acesso a dados com SQL parametrizado via pg
│       ├── erros/              # Códigos de erro, ErroAplicacao e handler global
│       ├── util/               # Paginação, validação EAN-13, autenticação
│       ├── docs/               # Especificação OpenAPI
│       └── scripts/            # migrar.js, semear.js, resetar.js
│
├── frontend/                   # SPA Vue 3 + Vite
│   ├── Dockerfile
│   ├── nginx.conf              # Servidor do build em produção
│   ├── vite.config.js
│   └── src/
│       ├── main.js             # Bootstrap: Pinia, TanStack Query, roteador
│       ├── App.vue
│       ├── rotas/              # Vue Router com guarda de autenticação
│       ├── paginas/            # Telas: Login, CadastroUsuario, ListagemProdutos,
│       │                       #   CadastroProduto, EdicaoProduto, DetalheProduto,
│       │                       #   HistoricoPreco, Categorias, UnidadesMedida
│       ├── componentes/        # Layout (Sidebar, TopBar, BottomNav, EstruturaApp) e formulários
│       │   ├── base/           # Botão, Campo, Select, Modal, Paginação, Badge, Interruptor
│       │   └── estado/         # Carregando, Vazio, Erro
│       ├── api/                # Cliente HTTP e chamadas por recurso
│       ├── stores/             # Pinia: sessão do usuário e filtros da listagem
│       ├── estilos/            # Tokens de design e CSS base
│       └── util/
│
├── shared/                     # Código compartilhado entre back-end e front-end
│   ├── schemas/                # Schemas Zod: produto, categoria, unidade, usuário, paginação
│   └── util/                   # Validação EAN-13
│
├── database/                   # Banco PostgreSQL 16
│   ├── docker-compose.yml      # Somente o Postgres (porta 5433)
│   ├── migrations/             # 001_usuario … 007_triggers
│   └── seed/                   # Unidades, categorias, usuário demo e massa de 5.000 produtos
│
├── desing-wireframe-produto/   # Wireframes das telas (PNG)
└── docs/                       # Documentação do projeto (ver seção "Documentação")
```

> Em `backend/src` e `frontend/src` ainda existem pastas de uma versão anterior que não são usadas pela aplicação atual: `controllers/`, `routes/`, `repositories/`, `models/`, `database/`, `app.js` (backend) e `router/`, `views/`, `components/`, `data/` (frontend). Os pontos de entrada ativos são `backend/src/server.js` e `frontend/src/main.js`.

## O que está implementado

- **Produtos**: cadastro, edição, listagem paginada e filtrável (nome, SKU, categoria, situação), inativação/reativação, exclusão física bloqueada por padrão (histórico de preço é preservado), histórico de preço completo.
- **Categorias**: hierarquia com subcategorias, inativação bloqueada quando há produto ativo vinculado.
- **Unidades de medida**: cadastro e listagem.
- **Autenticação simples**: cadastro e login por e-mail/senha (hash bcrypt), sem JWT/perfis — a sessão é identificada pelo header `x-usuario-id` enviado pelo front-end. Isso é suficiente para o escopo do projeto, mas **não é controle de acesso real** (qualquer cliente poderia enviar outro id).
- **Front-end**: nove telas responsivas (1440/1280/884/412 px), com estados de carregando, vazio, erro e sucesso, fiéis ao design em `desing-wireframe-produto/`.
- **API**: erros padronizados (`{ erro, codigo, detalhes }`), OpenAPI 3 em `/api/docs`.

## O que não está incluído

Collection do Postman e cobertura completa de testes automatizados não foram construídas nesta entrega — o foco foi ter o sistema funcionando, fiel ao design e pronto para uso via Docker. O planejamento de testes está na [Documentação de Testes](docs/Documenta%C3%A7%C3%A3o%20de%20testes.pdf).
