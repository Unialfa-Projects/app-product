# Contexto de build: raiz do repositório (precisa de acesso a shared/)
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json ./package.json
RUN npm install

COPY frontend/package.json ./frontend/package.json
RUN cd frontend && npm install

COPY shared ./shared
COPY frontend ./frontend

ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app/frontend
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
