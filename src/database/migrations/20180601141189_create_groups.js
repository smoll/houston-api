const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "groups";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("uuid").primary();
      table.string("label");
      table.string("description");
      table.string("entity_type");
      table.uuid("entity_uuid");
      table.boolean("custom");
      table.boolean("active");
      table.timestamps();

      table.index(["entity_type", "entity_uuid"]);
      table.unique(["label", "entity_type", "entity_uuid"]);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
