const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "module_deployments";

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.text('config');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn('config');
  });
};