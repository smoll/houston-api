const BaseModel = require("./base.js");
const CommonUtil = require("../../utils/common.js");

class SessionRefreshToken extends BaseModel {

  static get tableName() {
    return "session_refresh_tokens";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["user_uuid", "source", "metadata", "expires_at"],

      properties: {
        uuid: { type: "uuid" },
        refresh_token: { type: "string", minLength: 1 },
        user_uuid: { type: "uuid" },
        source: { type: "string", minLength: 1, maxLength: 255 },
        metadata: { type: "string", minLength: 1, maxLength: 255 },
        active: { type: "boolean" },
        expires_at: { type: "string" },
        refreshed_at: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "refresh_token", "user_uuid", "source", "metadata", "active", "expires_at", "refreshed_at", "created_at", "updated_at"];
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'session_refresh_tokens.user_uuid',
          to: 'users.uuid'
        }
      }
    };
  }

  $beforeInsert(context) {
    return CommonUtil.randomToken(20).then((token) => {
      this.refresh_token = token;
      this.active = true;
      return super.$beforeInsert(context);
    });
  }
}

module.exports = SessionRefreshToken;