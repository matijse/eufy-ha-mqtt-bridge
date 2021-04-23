FROM node:14-alpine

RUN apk add --no-cache --virtual .build-dependencies \
	&& apk --no-cache add libpng librsvg libgsf giflib libjpeg-turbo musl make g++ musl-utils libssl1.1 libcrypto1.1 \
	&& apk add libimagequant-dev fftw-dev build-base --update-cache  --repository https://alpine.global.ssl.fastly.net/alpine/edge/testing/  --repository https://alpine.global.ssl.fastly.net/alpine/edge/main \
	&& apk add vips-dev --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community \
	&& apk --no-cache add --virtual .build-dependencies g++ make python curl tar gtk-doc gobject-introspection expat-dev glib-dev libpng-dev libjpeg-turbo-dev giflib-dev librsvg-dev
#	&& su node \
#	&& npm install sharp@${SHARP_VERSION} --g --production --unsafe-perm \
#	&& chown node:node /usr/local/lib/node_modules -R \
#	&& apk del .build-dependencies

#RUN \
#    set -o pipefail \
#    \
#    && apk add --no-cache --virtual .build-dependencies \
#    \
#    && apk add --no-cache \
#        libcrypto1.1 \
#        libssl1.1 \
#        musl-utils \
#        musl \
#        make \
#        g++ \
#        sqlite \
#    && apk add libimagequant-dev --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main \
#    && apk add vips-dev --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community \
#    \
#    && rm -f -r \
#        /tmp/*

WORKDIR /app

RUN chown -R node:node /app

USER node

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . ./

CMD ["npm", "run", "start"]