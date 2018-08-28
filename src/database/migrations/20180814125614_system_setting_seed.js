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
    },
    {
      key: "worker_sizes",
      value: JSON.stringify({
        small: {
          limits: {
            cpu: "250m",
            memory: "1024Mi", // 1Gb
          },
          requests: {
            cpu: "375m",
            memory: "1536Mi", // 1.5Gb
          }
        },
        medium: {
          limits: {
            cpu: "500m",
            memory: "2048Mi", // 2Gb
          },
          requests: {
            cpu: "750m",
            memory: "3072Mi",  // 3Gb
          }
        },
        large: {
          limits: {
            cpu: "1000m",
            memory: "4096Mi", // 4Gb
          },
          requests: {
            cpu: "1500m",
            memory: "6144Mi", // 6Gb
          }
        },
      }),
      category: "deployment",
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
