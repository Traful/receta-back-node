FROM node:21.1-alpine3.17
WORKDIR /api
COPY package*.json ./
RUN npm install --omit=dev
COPY ./src ./src
EXPOSE 3001
CMD ["node", "./src/server.js"]

HEALTHCHECK CMD curl --fail http://localhost:3001 || exit 1

#Red: docker network create -d bridge receta-red

#docker container rm -f receta-back
#docker image rm -f receta-back-img

#docker build -t receta-back-img .
#docker container run -d --name receta-back --env-file .env -p 3001:3001 --network receta-red receta-back-img

#Sin la red
#docker container run -d --name receta-back --env-file .env -p 3001:3001 receta-back-img