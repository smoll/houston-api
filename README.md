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