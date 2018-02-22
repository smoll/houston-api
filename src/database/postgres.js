const Knex = require('knex');
const { Model, knexSnakeCaseMappers } = require('objection');

const Config = require("../utils/config.js");

const knex = Knex({
  client: 'postgres',

  connection: Config.get(Config.POSTGRES_URI),

  // automatically map snake_case columns to camelCase properties
  ...knexSnakeCaseMappers(),

  // configure migrations
  migrations: {
    directory: __dirname + "/./migrations",
    tableName: 'migrations'
  },

  debug: Config.get(Config.DEBUG_DB) === true
});

Model.knex(knex);

module.exports = {
  Postgres: knex,
  PostgresMigration: async () => {
    return await knex.migrate.latest();
  }
};
