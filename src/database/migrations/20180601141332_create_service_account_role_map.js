const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "service_account_role_map";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("service_account_uuid").references("uuid").inTable("service_accounts").notNullable().onDelete("CASCADE");
      table.uuid("role_uuid").references("uuid").inTable("roles").notNullable().onDelete("CASCADE");
      table.uuid("creator_uuid").references("uuid").inTable("users").nullable().onDelete("SET NULL");
      table.timestamps();

      table.primary(["service_account_uuid", "role_uuid"]);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};

