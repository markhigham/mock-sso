FROM node:14-slim AS base

WORKDIR /mock-sso
COPY package*.json ./

RUN npm install
COPY . ./
RUN npm run build

FROM base as release

WORKDIR /mock-sso
COPY --from=base /mock-sso/public /mock-sso/public
COPY package*.json ./
RUN npm install --production

COPY ./dist ./

EXPOSE 5000

CMD [ "node", "/mock-sso/dist/bin/mock-sso.js" ]
