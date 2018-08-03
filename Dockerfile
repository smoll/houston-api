#
# Houston API
# Source of truth for the Astronomer Platform

FROM astronomerinc/ap-base
MAINTAINER Astronomer <humans@astronomer.io>

ARG BUILD_NUMBER=-1
LABEL io.astronomer.docker.build.number=$BUILD_NUMBER
LABEL io.astronomer.docker.module="core"
LABEL io.astronomer.docker.component="houston"

ENV HOUSTON_DIR=/srv/houston-api

# Update apk
RUN apk update

WORKDIR ${HOUSTON_DIR}

COPY package.json package.json

RUN apk add --no-cache --virtual .build-deps \
		build-base \
		python \
		git \
	&& apk add --no-cache \
		nodejs \
		openssl \
	&& npm install \
	&& npm rebuild bcrypt --build-from-source \
	&& apk del .build-deps

COPY . .

EXPOSE 8870

ENTRYPOINT ["npm", "start"]
