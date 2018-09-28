const TABLE_NAME = "invite_tokens";

exports.up = function(knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.uuid("user_uuid").nullable().references("uuid").inTable("users").onDelete("CASCADE").index();
  });
};

exports.down = function(knex, Promise) {
  return Promise.resolve(true);
};
