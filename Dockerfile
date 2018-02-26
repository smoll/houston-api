#
# Houston API
# Source of truth for the Astronomer Platform

FROM alpine:3.7
MAINTAINER Astronomer <humans@astronomer.io>

# node-gyp requires python :(
RUN apk add --no-cache --virtual .build-deps \
        python \
        make \
        g++ \
	&& apk add --no-cache \
	    nodejs

WORKDIR /home/houston-api

COPY package.json .
COPY index.js .
COPY ./src ./src

# npm installs prebuit bcrypt package, have to compile for alpine
RUN npm install && \
    npm rebuild bcrypt --build-from-source

RUN apk del .build-deps

EXPOSE 5001:5001

ENTRYPOINT ["npm", "start"]
