const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "module_deployments";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("uuid").primary();
      table.string("type");
      table.string("title");
      table.uuid("creator_uuid").references("uuid").inTable("users").nullable().onDelete("SET NULL");
      table.uuid("team_uuid").references("uuid").inTable("teams").nullable().onDelete("SET NULL").index();
      table.string("release_name").unique();
      table.string("version");
      table.text("config");
      table.timestamps();

      // don"t allow the same team to have multiple deployments with the same title
      table.unique(["team_uuid", "title"], "unique_team_uuid_title");
    });
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
