const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "users";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("uuid").primary();
      table.string("username").unique();
      table.string("provider_type");
      table.string("provider_id");
      table.string("full_name");
      table.boolean("super_admin");
      table.string("status");
      table.timestamps();
      table.timestamp("deleted_at");
    }).then(() => {
      return MigrationHelper.timestampTrigger(knex, TABLE_NAME);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
