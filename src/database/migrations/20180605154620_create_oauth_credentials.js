const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "oauth_credentials";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.string("oauth_provider");
      table.string("oauth_user_id");
      table.uuid("user_uuid").index();
      table.timestamp("expires_at");
      table.timestamps();

      table.primary(["oauth_provider", "oauth_user_id"]);
    });
  });
};


exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
