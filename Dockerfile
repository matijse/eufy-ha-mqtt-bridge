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
        make \
        g++ \
        sqlite \
    && apk add libimagequant-dev --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main \
    && apk add vips-dev --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community \
    \
    && rm -f -r \
        /tmp/*

WORKDIR /app

COPY package*.json ./

RUN npm install --unsafe-perm

COPY . .

CMD ["npm", "run", "start"]