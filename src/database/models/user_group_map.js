const BaseModel = require("./base.js");

class UserGroup extends BaseModel {

  static get tableName() {
    return "user_group_map";
  }

  static get idColumn() {
    return ["user_uuid", "group_uuid"];
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["user_uuid", "group_uuid"],

      properties: {
        user_uuid: { type: "uuid" },
        group_uuid: { type: "uuid" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["user_uuid", "group_uuid"];
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'user_group_map.user_uuid',
          to: 'users.uuid',
        }
      },
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/group.js`,
        join: {
          from: 'user_group_map.group_uuid',
          to: 'groups.uuid',
        }
      }
    };
  }
}

module.exports = UserGroup;