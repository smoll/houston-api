#
# Houston API
# Source of truth for the Astronomer Platform

FROM alpine:3.7
MAINTAINER Astronomer <humans@astronomer.io>

RUN apk add --no-cache \
	nodejs

WORKDIR /home/houston-api

COPY package.json .
COPY index.js .
COPY src .

RUN npm install

EXPOSE 5001:5001

ENTRYPOINT ["npm", "start"]
