const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "role_permission_map";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("role_uuid").references("uuid").inTable("roles").notNullable().onDelete("CASCADE");
      table.string("permission_id").references("id").inTable("permissions").notNullable().onDelete("CASCADE");
      table.timestamps();

      table.primary(["role_uuid", "permission_id"]);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
