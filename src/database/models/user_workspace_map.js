const BaseModel = require("./base.js");

class UserWorkspace extends BaseModel {

  static get tableName() {
    return "user_workspace_map";
  }

  static get idColumn() {
    return ["user_uuid", "workspace_uuid"];
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["user_uuid", "workspace_uuid"],

      properties: {
        user_uuid: { type: "uuid" },
        workspace_uuid: { type: "uuid" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["user_uuid", "workspace_uuid"];
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'user_workspace_map.user_uuid',
          to: 'users.uuid',
        }
      },
      workspace: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/workspace.js`,
        join: {
          from: 'user_workspace_map.workspace_uuid',
          to: 'workspaces.uuid',
        }
      },
    };
  }
}

module.exports = UserWorkspace;