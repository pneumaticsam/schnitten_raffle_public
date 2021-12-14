
FROM node:17.2.0-alpine3.14

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["node", "server.js"]