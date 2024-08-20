FROM node:21.1-alpine3.17
WORKDIR /api
COPY package*.json ./
RUN npm install --prod
COPY ./src ./src
EXPOSE 3001
CMD ["node", "./src/index.js"]

HEALTHCHECK CMD curl --fail http://localhost:3001 || exit 1