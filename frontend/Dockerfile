# Etapa 1: gera os arquivos estáticos com o Vite
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Chave de API usada nas rotas de escrita (veja GESTOR_API_KEY no backend).
ARG VITE_API_KEY
ENV VITE_API_KEY=$VITE_API_KEY
RUN npm run build

# Etapa 2: serve o site com nginx e repassa /api para o backend
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
