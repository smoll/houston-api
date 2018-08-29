# Houston API

Houston API is the source of truth for the Astronomer Platform.

## ENV Vars
`NODE_ENV` (default "development") - Current env setting (development or production)

`PORT` (default: 5001) - Port the server will run on

`API_ENDPOINT_URL` (default: "/v1") - Path for GQL query and mutations requests

`WEBSOCKET_ENDPOINT_URL` (default: "/ws") - Path for GQL subscription requests

`PLAYGROUND_ENDPOINT_URL` (default: "/playground") - URL for GQL Playground

`HOUSTON_POSTGRES_URI` - Connection URI for Postgres for Houston to use

`AIRFLOW_POSTGRES_URI` - Connection URI for Postgres connection deployments will use

`DEBUG_DB` (default: false) - Boolean to enable debug output for database operations

`JWT_PASSPHRASE` - Passphrase used to sign Astronomer Platform JWTs

`REGISTRY_CERT_PATH` - Path to the TLS certs also used by the registry, used for signing registry JWTs

`REGISTRY_ISSUER` (default: "houston") - The issuer user in the JWT created for registry auths, should map to TLS cert CN

`REGISTRY_AUTH` - JSON data containing a username/password to use that Kubernetes is configured to send with regsitry requests

`REGISTRY_SERVICE` (default: "docker-registry") - Service name for docker registry

`HELM_GLOBAL_CONFIG` - JSON global config data used in the astronomer platform install

`HELM_ASTRO_REPO` (default: https://helm.astronomer.io/) - URL of helm chart to use for deployments

`HELM_REPO_EDGE` (default: false) - Boolean to enable RC builds of the helm chart

`COMMANDER_HOST` - Hostname of the Commander service

`COMMANDER_PORT` - Port of the Commander service

`ORBIT_BASE_URL` - Base URL to the Orbit UI, must include protocol, no trailing slash required

`AUTH_STRATEGY` (default: "local") - Enabled auth strategies, can be: local, auth0_oauth, google_oauth, or github_oauth

`GOOGLE_CLIENT_ID` - Google OAuth credential clientId

`GITHUB_CLIENT_ID` - Github OAuth credential clientId

`AUTH0_CLIENT_ID` - Auth0 OAuth credential clientId

`AUTH0_BASE_DOMAIN` - Auth0 base domain

`AUTH0_EXTERNAL_LOGIN` - Boolean flag if Auth0 external login form should be enabled (Required to use Auth0 connections other than Google and Github)

## Migrations

### Creating migration files

Ensure Knex CLI is installed (`npm install -g knex`)

Run `knex migrate:make [file suffix]`, and it will create a file in `./src/database/migrations`

## Notes
`import/export` is purposely avoided since it isn't currently natively support by NodeJS.
At this point in time we are attempting to avoid needing to use babel

`async/await` is preferred over `promise` in all situations

## Testing
When testing, you will first need to load up a test Postgres instance.
The data is volatile, spinning down the docker container will clear it.

Run `npm run test-db` to launch the test Postgres, and `test-db-down` to turn it off/reset it

Once PostgreSQL is running `npm run test` can now be run.

## Development
When developing you will want to test your changes locally before pushing a change.
You can do this by running `docker-compose up` from your root houston-api project directory. You will want to create a file named `docker-compose.override.yaml`. This override file will supply configurations for running the project locally. Example found below.

In some circumstances the API server will spin up before the Postgres dependency is ready.
You can resolve this error by opening up and `.js` houston-api file, making a change and saving the file.
This will trigger the API server to restart and look for the Postgres database again.

```yaml
---
version: "2.1"

volumes:
  postgres_data:

services:
  houston-api:
    environment:
      AUTH0_EXTERNAL_LOGIN: "false"
      AUTH0_CUSTOM: "true"
      HELM_GLOBAL_CONFIG: "{\"baseDomain\":\"local.astronomer.io\",\"acme\":false,\"rbacEnabled\":true,\"releaseName\":\"release-name\",\"registrySecretName\":\"registry\"}"
      BASE_URL_ORBIT: "http://app.local.astronomer.io:5000/"
      BASE_URL_HOUSTON: "http://houston.local.astronomer.io:8870/"
```
