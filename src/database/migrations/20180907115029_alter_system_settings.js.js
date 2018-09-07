const TABLE_NAME = "system_settings";

exports.up = function(knex, Promise) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.text("value").alter();
  });
};


exports.down = function(knex, Promise) {
  return Promise.resolve(true);
};
