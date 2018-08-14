const Config = require("../../utils/config.js");

const SYSTEM_SETTING_TABLE = "system_settings";

exports.up = function(knex) {

  const settings = [
    {
      key: "reply_email",
      value: `noreply@${Config.baseDomain()}`,
      category: "system",
    },
    {
      key: "company_name",
      value: `Astronomer EE`,
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
    },
  ];

  return knex(SYSTEM_SETTING_TABLE).insert(settings.map((setting) => {
    setting.created_at = new Date().toISOString();
    if (!setting.hasOwnProperty("is_encrypted")) {
      setting.is_encrypted = false;
    }
    return setting;
  }));
};

exports.down = function(knex) {
};
