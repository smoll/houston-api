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
      table.uuid("team_uuid").nullable().references("uuid").inTable("teams").onDelete("CASCADE").index();
      table.timestamps();

      table.unique(["label", "team_uuid"]);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
