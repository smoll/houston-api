const BaseModel = require("./base.js");

class Role extends BaseModel {

  static get tableName() {
    return "roles";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["label", "category"],

      properties: {
        uuid: { type: "uuid" },
        label: { type: "string", minLength: 1, maxLength: 255 },
        category: { type: "string", minLength: 1, maxLength: 64 },
        entity_type: { type: "string", minLength: 1, maxLength: 32 },
        entity_uuid: { type: "uuid" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "label", "category", "entity_type", "entity_uuid"];
  }

  static get relationMappings() {

  }
}

module.exports = Role;