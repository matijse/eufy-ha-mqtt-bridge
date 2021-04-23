FROM node:14-alpine

RUN \
    set -o pipefail \
    \
    && apk add --no-cache --virtual .build-dependencies \
    \
    && apk add --no-cache \
        libcrypto1.1 \
        libssl1.1 \
        musl-utils \
        musl \
        vips-dev \
        make \
    \
    && rm -f -r \
        /tmp/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]