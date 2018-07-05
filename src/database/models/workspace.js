const BaseModel = require("./base.js");

class Workspace extends BaseModel {

  static get tableName() {
    return "workspaces";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["label"],

      properties: {
        uuid: { type: "uuid" },
        label: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: "string", minLength: 1, maxLength: 255 },
        active: { type: "boolean" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "label", "description", "active"];
  }

  static get relationMappings() {
    return {
      groups: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/group.js`,
        filter: {
          "entity_type": "workspace"
        },
        join: {
          from: 'workspaces.uuid',
          to: 'groups.entity_uuid'
        }
      },
      users: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'workspaces.uuid',
          through: {
            model: `${__dirname}/user_workspace_map.js`,
            from: `user_workspace_map.workspace_uuid`,
            to: `user_workspace_map.user_uuid`
          },
          to: 'users.uuid',
        }
      },
    };
  }

  $beforeInsert(context) {
    this.active = true;
    return super.$beforeInsert(context);
  }
}

module.exports = Workspace;
