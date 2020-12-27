FROM node:14-alpine

RUN apk add python

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]