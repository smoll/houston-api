module.exports = {
  timestampTrigger: function(knex, table) {
    return knex.raw(`
    CREATE TRIGGER set_timestamp
      BEFORE INSERT OR UPDATE ON ${table}
        FOR EACH ROW
          EXECUTE PROCEDURE trigger_set_timestamp();
    `);
  }
};