FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install && npm rebuild

COPY . .

RUN mkdir -p /app/database

CMD ["npm", "start"]
