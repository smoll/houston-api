const Config = require("../../utils/config.js");

const SYSTEM_SETTING_TABLE = "system_settings";

const insertIfNotExists = async (knex, record) => {
  const setting = await knex.select().where("key", record.key);
  if (setting.length) {
    return;
  }
  return await knex.insert(record);
};

exports.up = function(knex) {

  const settings = [
    {
      key: "reply_email",
      value: `noreply@${Config.baseDomain().split(":")[0]}`,
      category: "system",
    },
    {
      key: "company_name",
      value: `Astronomer`,
      category: "system",
    },
    {
      key: "user_confirmation",
      value: `true`,
      category: "authentication",
    },
    {
      key: "domain_whitelist",
      value: Config.baseDomain(),
      category: "authentication",
    }
  ];

  const promises = [];

  for(let setting of settings) {
    setting.created_at = new Date().toISOString();
    if (!setting.hasOwnProperty("is_encrypted")) {
      setting.is_encrypted = false;
    }
    promises.push(insertIfNotExists(knex(SYSTEM_SETTING_TABLE), setting));
  }
  return Promise.all(promises);
};

exports.down = function(knex) {
};
