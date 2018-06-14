const BaseModel = require("./base.js");
const CommonUtil = require("../../utils/common.js");

class InviteToken extends BaseModel {

  static get tableName() {
    return "invite_tokens";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["email", "team_uuid", "assignments"],

      properties: {
        uuid: { type: "uuid" },
        email: { type: "string" },
        token: { type: "string", length: 16 },
        team_uuid: { type: "uuid" },
        assignments: { type: "object" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "email", "token", "team_uuid", "assignments", "created_at", "updated_at"];
  }

  static get relationMappings() {
    return {
      team: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/team.js`,
        join: {
          from: 'invite_tokens.team_uuid',
          to: 'teams.uuid'
        }
      }
    };
  }

  $beforeInsert(context) {
    return CommonUtil.randomToken(16).then((token) => {
      this.token = token;
      return super.$beforeInsert(context);
    });
  }
}

module.exports = InviteToken;