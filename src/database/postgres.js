const Knex = require("knex");
const { Model, knexSnakeCaseMappers } = require("objection");

const Config = require("../utils/config.js");

const houston = Knex({
  client: "postgres",

  connection: Config.get(Config.HOUSTON_POSTGRES_URI),

  // automatically map snake_case columns to camelCase properties
  ...knexSnakeCaseMappers(),

  // configure migrations
  migrations: {
    directory: __dirname + "/./migrations",
    tableName: "migrations"
  },

  debug: Config.get(Config.DEBUG_DB) === "true"
});

const airflow = Knex({
  client: "postgres",
  connection: Config.get(Config.AIRFLOW_POSTGRES_URI),
  debug: Config.get(Config.DEBUG_DB) === "true"
});

Model.knex(houston);

module.exports = {
  Postgres: houston,
  Airflow: airflow,
  PostgresMigration: async () => {
    return await houston.migrate.latest();
  }
};
