const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "users";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("uuid").primary();
      table.string("username").unique();
      table.string("provider_type");
      table.string("provider_uuid");
      table.string("full_name");
      table.string("status");
      table.timestamps();
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
