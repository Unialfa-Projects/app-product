# SIGE — Módulo Produtos

Cadastro central de produtos para um e-commerce de variedades: produtos, categorias (com subcategorias), unidades de medida, histórico de preço e autenticação simples por e-mail/senha.

Stack: **Node.js 22 + Fastify 5 + PostgreSQL 16** (API) e **Vue 3 + Vite** (front-end), com SQL explícito via `pg` (sem ORM) e validação única via **Zod** compartilhada entre back-end e formulários.

## Subir tudo com Docker (recomendado)

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

## Estrutura do repositório

```
backend/     API Fastify — rotas → serviços → repositórios (SQL parametrizado)
frontend/    SPA Vue 3 — páginas, componentes, stores Pinia, TanStack Query
shared/      Schemas Zod e utilitários usados por back-end e front-end
database/    Migrations, seeds, massa de dados e docker-compose do Postgres
docs/        Documento de especificação original do módulo
```

## O que está implementado

- **Produtos**: cadastro, edição, listagem paginada e filtrável (nome, SKU, categoria, situação), inativação/reativação, exclusão física bloqueada por padrão (histórico de preço é preservado), histórico de preço completo.
- **Categorias**: hierarquia com subcategorias, inativação bloqueada quando há produto ativo vinculado.
- **Unidades de medida**: cadastro e listagem.
- **Autenticação simples**: cadastro e login por e-mail/senha (hash bcrypt), sem JWT/perfis — a sessão é identificada pelo header `x-usuario-id` enviado pelo front-end. Isso é suficiente para o escopo do projeto, mas **não é controle de acesso real** (qualquer cliente poderia enviar outro id).
- **Front-end**: nove telas responsivas (1440/1280/884/412 px), com estados de carregando, vazio, erro e sucesso, fiéis ao design em `desing-wireframe-produto/`.
- **API**: erros padronizados (`{ erro, codigo, detalhes }`), OpenAPI 3 em `/api/docs`.

## O que não está incluído

Testes automatizados, Collection do Postman e a documentação acadêmica completa (matriz de rastreabilidade, plano de testes, etc.) descrita em `docs/prompt-kiro-sige-produtos.md` não foram construídos nesta entrega — o foco foi ter o sistema funcionando, fiel ao design e pronto para uso via Docker.
