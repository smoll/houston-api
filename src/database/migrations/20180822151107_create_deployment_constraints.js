const TABLE_NAME = "deployment_constraints";

exports.up = function(knex) {
  return knex.schema.hasTable(TABLE_NAME).then((exists) => {
    if (exists) {
      return;
    }

    return knex.schema.createTable(TABLE_NAME, function (table) {
      table.increments();
      table.string("entity_type");
      table.uuid("entity_uuid").nullable();
      table.text("defaults");
      table.text("limits");
      table.timestamps();

      table.unique(["entity_type", "entity_uuid"]);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
