const BaseModel = require("./base.js");

const Password = require('objection-password-bcryptjs')({
  allowEmptyPassword: true,
  rounds: 10
});

class LocalCredential extends Password(BaseModel) {

  // used to get the provider_type for the users table
  providerType() {
    return LocalCredential.PROVIDER_TYPE;
  }

  static get tableName() {
    return "local_credentials";
  }

  static get idColumn() {
    return "userUuid";
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["user_uuid", "password"],

      properties: {
        user_uuid: { type: "uuid" },
        password: { type: "string", minLength: 1, maxLength: 255 },
        reset_token: { type: "string", minLength: 1, maxLength: 255 },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["user_uuid", "password", "created_at", "updated_at"];
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'local_credentials.user_uuid',
          to: 'users.uuid'
        }
      }
    };
  }
}

LocalCredential.PROVIDER_TYPE = "local";

module.exports = LocalCredential;
