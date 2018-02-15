#
# Houston API
# Source of truth for the Astronomer Platform

FROM alpine:3.7
MAINTAINER Astronomer <humans@astronomer.io>

RUN apk add --no-cache \
	nodejs

WORKDIR /tmp/houston-api
COPY . .

ENTRYPOINT ["npm", "start"]
