const TABLE_NAME = "organization_users";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.uuid("organization_uuid").references('uuid').inTable('organizations').notNull().onDelete('CASCADE');
      table.uuid("user_uuid").references('uuid').inTable('users').notNull().onDelete('CASCADE');
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};