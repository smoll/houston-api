const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "role_permission_map";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("role_uuid").references("uuid").inTable("roles").notNullable().onDelete("CASCADE");
      table.uuid("permission_uuid").references("uuid").inTable("permissions").notNullable().onDelete("CASCADE");
      table.uuid("creator_uuid").references("uuid").inTable("users").notNullable().onDelete("CASCADE");
      table.timestamps();

      table.primary(["role_uuid", "permission_uuid"]);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
