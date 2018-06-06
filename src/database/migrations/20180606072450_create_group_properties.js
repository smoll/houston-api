const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "group_properties";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("group_uuid").references("uuid").inTable("groups").notNullable().onDelete("CASCADE");
      table.string("key");
      table.string("value");
      table.string("category").index();
      table.timestamps();

      table.primary(["group_uuid", "key"]);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
