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
      table.string("release_name").unique();
      table.string("version");
      table.uuid("creator_uuid").references('uuid').inTable('users').notNull().onDelete('SET NULL');
      // set foreign key onDelete to "restrict" as a module deployment has physical resources associated with it.  Those need to be cleaned up first
      table.uuid("organization_uuid"); //.references('uuid').inTable('organizations').notNull().onDelete('RESTRICT').index();
      table.uuid("team_uuid").index().nullable();
      table.timestamps();
      table.timestamp("deleted_at");

      // don't allow the same organization to have multiple deployments with the same title
      table.unique(["organization_uuid", "title"]);
    }).then(() => {
      return MigrationHelper.generateUuid(knex, TABLE_NAME);
    }).then(() => {
      return MigrationHelper.timestampTrigger(knex, TABLE_NAME);
    });
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
