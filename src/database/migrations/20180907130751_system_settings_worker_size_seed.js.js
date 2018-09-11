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
      key: "worker_sizes",
      value: JSON.stringify({
        small: {
          requests: {
            cpu: "500m",
            memory: "1Gi", // 1Gb
          },
          limits: {
            cpu: "750m",
            memory: "1536Mi", // 1.5Gb
          }
        },
        medium: {
          requests: {
            cpu: "1000m",
            memory: "2Gi", // 2Gb
          },
          limits: {
            cpu: "1500m",
            memory: "3Gi",  // 3Gb
          }
        },
        large: {
          requests: {
            cpu: "2000m",
            memory: "4Gi", // 4Gb
          },
          limits: {
            cpu: "3000m",
            memory: "6Gi", // 6Gb
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
