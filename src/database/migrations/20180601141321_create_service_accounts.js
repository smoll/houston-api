const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "service_accounts";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("uuid").primary();
      table.string("api_key").index();
      table.string("label");
      table.string("category");
      table.uuid("creator_uuid").references("uuid").inTable("users").notNullable().onDelete("CASCADE").index();
      table.string("entity_type");
      table.uuid("entity_uuid");
      table.timestamps();

      table.index(["entity_type", "entity_uuid"]);

    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};