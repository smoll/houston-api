const BaseModel = require("./base.js");

class OauthCredential extends BaseModel {

  // used to get the provider_type for the users table
  providerType() {
    return OauthCredential.PROVIDER_TYPE;
  }

  static get tableName() {
    return "oauth_credentials";
  }

  static get idColumn() {
    return ["oauth_provider", "oauth_user_id"];
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["oauth_provider", "oauth_user_id"],

      properties: {
        oauth_provider: { type: "string" },
        oauth_user_id: { type: "string" },
        user_uuid: { type: "uuid" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["oauth_provider", "user_uuid", "created_at", "updated_at"];
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'oauth_credentials.user_uuid',
          to: 'users.uuid'
        }
      }
    };
  }
}

OauthCredential.PROVIDER_TYPE = "oauth";

module.exports = OauthCredential;