FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /app/database

EXPOSE 1234

CMD ["npm", "start"]
