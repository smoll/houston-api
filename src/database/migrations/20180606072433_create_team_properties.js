const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "team_properties";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("team_uuid").references("uuid").inTable("teams").notNullable().onDelete("CASCADE");
      table.string("key");
      table.string("value");
      table.string("category").index();
      table.timestamps();

      table.primary(["team_uuid", "key"]);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
