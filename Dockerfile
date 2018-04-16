#
# Houston API
# Source of truth for the Astronomer Platform

FROM alpine:3.7
MAINTAINER Astronomer <humans@astronomer.io>

WORKDIR /home/houston-api
COPY . .

RUN apk add --no-cache --virtual .build-deps \
		build-base \
		python \
	&& apk add --no-cache \
		nodejs \
		git \
	&& npm install \
	&& npm rebuild bcrypt --build-from-source \
	&& apk del .build-deps

EXPOSE 8870
ENTRYPOINT ["npm", "start"]
