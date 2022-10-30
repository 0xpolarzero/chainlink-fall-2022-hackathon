# syntax=docker/dockerfile:1
FROM node:14.15.4 as base

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock

FROM base as test
RUN yarn run ci
COPY . .
RUN yarn run test

FROM base as prod
RUN yarn run ci --production
COPY . .
CMD [ "node", "server.js" ]