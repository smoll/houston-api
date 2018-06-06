const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "emails";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.increments("id").primary().unsigned();
      table.string("address").unique();
      table.uuid("user_uuid").references("uuid").inTable("users").notNullable().onDelete("CASCADE").index();
      table.string("token").unique();
      table.boolean("main"); // primary, but "primary" is reserved
      table.boolean("verified");
      table.timestamps();
    });
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
