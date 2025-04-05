FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install && npm rebuild

COPY . .

RUN mkdir -p /app/database

EXPOSE 1234

CMD ["npm", "start"]
