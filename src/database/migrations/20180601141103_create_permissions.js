const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "permissions";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.string("id").primary();
      table.string("scope").notNullable().index(); // global, user
      table.string("label");
      table.string("category");
      table.timestamps();
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};