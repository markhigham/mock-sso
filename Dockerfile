FROM node:12

WORKDIR /mock-sso

COPY package*.json ./

COPY . ./
RUN npm install

EXPOSE 5000

CMD [ "node", "/mock-sso/dist/bin/mock-sso.js" ]
