# Houston API

Houston API is the source of truth for the Astronomer Platform.


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
When developing you will want to test your changes locally before pushing a change. You can do this by running `docker-compose up` from your root houston-api project directory. In some circumstances the API server will spin up before the Postgres dependency is ready. You can resolve this error by opening up and `.js` houston-api file, making a change and saving the file. This will trigger the API server to restart and look for the Postgres database again. 
