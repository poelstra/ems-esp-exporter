FROM node:22-alpine

VOLUME /config
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENTRYPOINT ["node", "/app/dist/index"]
CMD [""]
