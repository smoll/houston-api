const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "invite_tokens";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("uuid").primary();
      table.string("email").index();
      table.string("token").unique();
      table.uuid("team_uuid").nullable().references("uuid").inTable("teams").onDelete("CASCADE").index();
      table.string("assignments"); // what access this token grants the user accepting it
      table.timestamps();
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
