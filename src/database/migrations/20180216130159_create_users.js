const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "users";

exports.up = function(knex) {
  console.log("Does the table exist");
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      console.log(exists);
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("uuid").primary();
      table.string("username").unique();
      table.string("password");
      table.boolean("super_admin");
      table.string("status");
      table.timestamps();
      table.timestamp("deleted_at");
    }).then(() => {
      return MigrationHelper.generateUuid(knex, TABLE_NAME);
    }).then(() => {
      return MigrationHelper.timestampTrigger(knex, TABLE_NAME);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
