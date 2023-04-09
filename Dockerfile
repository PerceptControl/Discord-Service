FROM node:18-buster
WORKDIR /code

COPY . .
COPY package*.json ./
RUN npm install

CMD ["node", "./lib/index.js"]