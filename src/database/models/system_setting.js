const BaseModel = require("./base.js");

class SystemSetting extends BaseModel {

  static get tableName() {
    return "system_settings";
  }

  static get idColumn() {
    return ["key"];
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["key", "value", "category"],

      properties: {
        key: { type: "string" },
        value: { type: "string" },
        category: { type: "string" },
        is_encrypted: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["key", "value", "category"];
  }
}

SystemSetting.KEY_USERS_GROUP_UUID = "users_group_uuid";
SystemSetting.KEY_ADMIN_GROUP_UUID = "admin_group_uuid";
SystemSetting.KEY_DEFAULT_TEAM_GROUPS = "default_team_groups";

SystemSetting.CATEGORY_INTERNAL = "internal";

module.exports = SystemSetting;