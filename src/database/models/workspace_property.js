const BaseModel = require("./base.js");

class WorkspaceProperty extends BaseModel {

  static get tableName() {
    return "workspace_properties";
  }

  static get idColumn() {
    return ["workspace_uuid", "key"];
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["workspace_uuid", "key", "value"],

      properties: {
        workspace_uuid: { type: "uuid" },
        key: { type: "string" },
        value: { type: "string" },
        category: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["workspace_uuid", "key", "value", "category"];
  }

  static get relationMappings() {
    return {
      workspace: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/workspace.js`,
        join: {
          from: 'workspace_properties.workspace_uuid',
          to: 'workspaces.uuid',
        }
      },
    };
  }
}

module.exports = WorkspaceProperty;