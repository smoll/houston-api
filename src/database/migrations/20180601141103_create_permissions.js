const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "permissions";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("uuid").primary();
      table.string("label").unique();
      table.string("scope").notNullable().index(); // global, team, user
      table.string("category");
      table.timestamps();
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
/*
// permissions

(USER)

user_view
user_update
user_delete

group_create
group_list
group_view
group_update
group_delete

group_user_add
group_user_remove
group_user_manage_permissions

role_create
role_list
role_view
role_update
role_delete

team_create
team_list
team_view
team_update
team_delete

team_user_add
team_user_remove

service_account_create
service_account_list
service_account_view
service_account_update
service_account_delete

(GLOBAL)
user_create
user_list
user_view
user_update
user_delete

group_create
group_list
group_view
group_update
group_delete

group_user_add
group_user_remove
group_user_manage_permissions

team_create
team_list
team_view
team_update
team_delete

role_create
role_list
role_view
role_update
role_delete

service_account_create
service_account_list
service_account_view
service_account_update
service_account_delete

manage_team_defaults

*/