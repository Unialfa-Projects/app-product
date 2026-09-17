# Contexto de build: raiz do repositório (precisa de acesso a shared/ e database/)
FROM node:22-alpine

WORKDIR /app

COPY package.json ./package.json
RUN npm install --omit=dev

COPY backend/package.json ./backend/package.json
RUN cd backend && npm install --omit=dev

COPY shared ./shared
COPY database ./database
COPY backend ./backend

WORKDIR /app/backend
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/server.js"]
