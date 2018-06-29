const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "oauth_credentials";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("uuid").primary();
      table.string("oauth_provider").index();
      table.string("oauth_user_id").index();
      table.string("refresh_token");
      table.string("access_token");
      table.timestamp("expires_at");
      table.timestamps();

      table.unique(["oauth_provider", "oauth_user_id"]);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
