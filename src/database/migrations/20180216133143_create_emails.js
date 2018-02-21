const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "emails";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.increments('id').primary().unsigned();
      table.string("address").unique();
      table.uuid("user_uuid").references('uuid').inTable('users').notNull().onDelete('CASCADE').index();
      table.string("token").unique();
      table.boolean("main");
      table.boolean("verified");
      table.timestamps();
      table.timestamp("deleted_at");
    }).then(() => {
      return MigrationHelper.timestampTrigger(knex, TABLE_NAME);
    });
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
