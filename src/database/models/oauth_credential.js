const BaseModel = require("./base.js");

class OAuthCredential extends BaseModel {

  static get tableName() {
    return "oauth_credentials";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["oauth_provider", "access_token", "expires_at"],

      properties: {
        uuid: { type: "uuid" },
        oauth_provider: { type: "string" },
        oauth_user_id: { type: "string" },
        refresh_token: { type: "string" },
        access_token: { type: "string" },
        expires_at: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "oauth_provider", "refresh_token", "access_token", "expires_at", "created_at", "updated_at"];
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/user.js`,
        filter: {
          provider: "oauth"
        },
        beforeInsert(model) {
          model.provider = 'oauth';
        },
        join: {
          from: 'oauth_credentials.uuid',
          to: 'users.provider_uuid'
        }
      }
    };
  }
}

module.exports = OAuthCredential;