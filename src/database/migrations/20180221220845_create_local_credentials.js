const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "local_credentials";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("user_uuid").primary();
      table.string("password").unique();
      table.string("reset_token").index();
      table.timestamps();
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
