const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "user_group_map";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("user_uuid").references("uuid").inTable("users").notNullable().onDelete("CASCADE");
      table.uuid("group_uuid").references("uuid").inTable("groups").notNullable().onDelete("CASCADE");
      table.timestamps();

      table.primary(["user_uuid", "group_uuid"]);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
