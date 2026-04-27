FROM node:24.14.1-alpine3.23

VOLUME /config
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm test && npm run build

ENTRYPOINT ["node", "/app/dist/index"]
CMD [""]
