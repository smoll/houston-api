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

module.exports = SystemSetting;