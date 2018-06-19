const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "system_settings";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.string("key").primary();
      table.string("value");
      table.string("category").index();
      table.boolean("is_encrypted");
      table.timestamps();
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
