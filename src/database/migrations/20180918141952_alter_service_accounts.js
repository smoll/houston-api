const TABLE_NAME = "service_accounts";

exports.up = function(knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.timestamp("last_used_at");
  });
};

exports.down = function(knex, Promise) {
  return Promise.resolve(true);
};
