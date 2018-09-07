const TABLE_NAME = "deployments";

exports.up = function(knex, Promise) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string("registry_password");
  });
};

exports.down = function(knex, Promise) {
  return Promise.resolve(true);
};
