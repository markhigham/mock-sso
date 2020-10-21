FROM node:12

WORKDIR /mock-sso

COPY package*.json ./
RUN npm install --production

COPY . ./

EXPOSE 5000

CMD [ "node", "/mock-sso/bin/mock-sso.js" ]