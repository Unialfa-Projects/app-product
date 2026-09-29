# SIGE - Produtos

Frontend (Vue 3 + Vite) e backend (Fastify + PostgreSQL). Detalhes da API em [backend/README.md](backend/README.md).

## Subir tudo com Docker

Nesta pasta:

```sh
docker compose up --build
```

| Serviço | Endereço |
|---|---|
| Site | http://localhost:8080 |
| API | http://localhost:3001 (documentação em `/docs`) |
| PostgreSQL | localhost:5434 |

O nginx do contêiner `frontend` repassa `/api` para o `backend`, que usa o banco `banco`. As tabelas são criadas por `backend/docker/postgres/init.sql` na primeira vez que o volume é criado.

Primeiro uso: crie uma conta na tela de login, entre, cadastre uma **categoria** e uma **unidade de medida** e depois cadastre os produtos.

As chaves de API (`GESTOR_API_KEY`, `OPERADOR_API_KEY`) e a senha do banco podem ser trocadas por variáveis de ambiente ou por um arquivo `.env` nesta pasta. O frontend recebe `GESTOR_API_KEY` durante o build.

## Desenvolvimento sem Docker no frontend

```sh
cd frontend
npm ci
npm run dev
```

O Vite repassa `/api` para `http://localhost:3001`. Suba antes o banco e o backend (`docker compose up banco backend`). A chave de API vem de `VITE_API_KEY` (veja `frontend/.env.example`).
