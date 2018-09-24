#!/usr/bin/env bash

# Ensure vars get defaulted
if [[ -z "${PG_PORT}" ]]; then
  PG_PORT=5932
fi

if [[ -z "${PG_HOST}" ]]; then
  PG_HOST="localhost"
fi

export HOUSTON_POSTGRES_URI=postgres://postgres:postgres@${PG_HOST}:${PG_PORT}/postgres
export AIRFLOW_POSTGRES_URI=${HOUSTON_POSTGRES_URI}
export HELM_GLOBAL_CONFIG="{\"baseDomain\":\"local.astronomer.io\",\"acme\":false,\"rbacEnabled\":true,\"releaseName\":\"release-name\",\"releaseNamespace\":\"cj-dev\",\"releaseVersion\":\"0.4.2\",\"registrySecretName\":\"registry\"}"
export BASE_URL_ORBIT="http://app.local.astronomer.io:5000/"
export BASE_URL_HOUSTON="http://houston.local.astronomer.io:8870/"

export DEBUG_DB=false

if [ -z "$1" ]; then
    ./includes/entrypoint ./node_modules/.bin/jest unit
else
    ./includes/entrypoint ./node_modules/.bin/jest $1
fi