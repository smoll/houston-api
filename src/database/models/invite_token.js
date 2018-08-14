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
      required: ["email", "workspace_uuid", "assignments"],

      properties: {
        uuid: { type: "uuid" },
        email: { type: "string" },
        token: { type: "string", length: 16 },
        workspace_uuid: { type: "uuid" },
        assignments: { type: "object" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "email", "token", "workspace_uuid", "assignments", "created_at", "updated_at"];
  }

  static get relationMappings() {
    return {
      workspace: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/workspace.js`,
        join: {
          from: 'invite_tokens.workspace_uuid',
          to: 'workspaces.uuid'
        }
      }
    };
  }

  $beforeInsert(context) {
    this.token = this.generateShortId()
    return super.$beforeInsert(context);
  }
}

module.exports = InviteToken;