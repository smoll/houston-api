module.exports = {

  insertSystemSettingIfNotExists: async (knex, record) => {
    const setting = await knex.select().where("key", record.key);
    if (setting.length) {
      return;
    }
    return await knex.insert(record);
  },
};