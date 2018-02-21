const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "organizations";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("uuid").primary();
      table.string("title");
      table.string("description");
      table.string("plan");
      table.boolean("enabled");
      table.timestamps();
      table.timestamp("deleted_at");
    }).then(() => {
      return MigrationHelper.generateUuid(knex, TABLE_NAME);
    }).then(() => {
      return MigrationHelper.timestampTrigger(knex, TABLE_NAME);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};