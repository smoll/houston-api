const BaseModel = require("./base.js");

class GroupProperty extends BaseModel {

  static get tableName() {
    return "group_properties";
  }

  static get idColumn() {
    return ["group_uuid", "key"];
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["group_uuid", "key", "value"],

      properties: {
        group_uuid: { type: "uuid" },
        key: { type: "string" },
        value: { type: "string" },
        category: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["group_uuid", "key", "value", "category"];
  }

  static get relationMappings() {
    return {
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/group.js`,
        join: {
          from: 'group_properties.group_uuid',
          to: 'groups.uuid',
        }
      },
    };
  }
}

module.exports = GroupProperty;