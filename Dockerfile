FROM node:20 as build

WORKDIR /app

COPY ./.yarnrc.yml /app/.yarnrc.yml
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN corepack enable
RUN yarn install
COPY . .

EXPOSE 3000

CMD ["node", "./src/index.js"]