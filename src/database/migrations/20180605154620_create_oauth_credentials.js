const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "oauth_credentials";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("uuid").primary();
      table.timestamps();
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
