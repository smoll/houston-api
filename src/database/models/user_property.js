const BaseModel = require("./base.js");

class UserProperty extends BaseModel {

  static get tableName() {
    return "user_properties";
  }

  static get idColumn() {
    return ["user_uuid", "key"];
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["user_uuid", "key", "value"],

      properties: {
        user_uuid: { type: "uuid" },
        key: { type: "string" },
        value: { type: "string" },
        category: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["user_uuid", "key", "value", "category"];
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'user_properties.user_uuid',
          to: 'users.uuid',
        }
      },
    };
  }
}

UserProperty.KEY_AVATAR_URL = "avatarUrl";

UserProperty.CATEGORY_PROFILE = "profile";

module.exports = UserProperty;