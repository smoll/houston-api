const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "user_workspace_map";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("user_uuid").references("uuid").inTable("users").notNullable().onDelete("CASCADE");
      table.uuid("workspace_uuid").references("uuid").inTable("workspaces").notNullable().onDelete("CASCADE");
      table.timestamps();

      table.primary(["user_uuid", "workspace_uuid"]);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
