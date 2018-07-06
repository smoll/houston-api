const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "deployments";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("uuid").primary();
      table.string("type");
      table.string("label");
      table.uuid("workspace_uuid").references("uuid").inTable("workspaces").notNullable().onDelete("RESTRICT").index();
      table.string("release_name").unique();
      table.string("version");
      table.text("config");
      table.timestamps();

      // don"t allow the same workspace to have multiple deployments with the same label
      table.unique(["workspace_uuid", "label"], "unique_workspace_uuid_label");
    });
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
