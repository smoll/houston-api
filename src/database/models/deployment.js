const _ = require("lodash");
const BaseModel = require("./base.js");

class Deployment extends BaseModel {

  static get tableName() {
    return "deployments";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["type", "label", "release_name", "version", "workspace_uuid"],

      properties: {
        uuid: { type: "uuid" },
        type: { type: "string"},
        label: { type: "string", minLength: 1, maxLength: 255 },
        release_name: { type: "string", minLength: 1, maxLength: 128 },
        version: { type: "string" },
        workspace_uuid: { type: ["string"] },
        config: { type: "object" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "type", "label", "release_name", "version", "workspace_uuid", "config", "created_at", "updated_at"];
  }

  static get relationMappings() {
    return {
      workspace: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/workspace.js`,
        join: {
          from: 'deployments.workspace_uuid',
          to: 'workspaces.uuid'
        }
      },
      groups: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/group.js`,
        filter: {
          "entity_type": "deployment"
        },
        join: {
          from: 'deployments.uuid',
          to: 'groups.entity_uuid'
        }
      },
    };
  }

  getConfigCopy() {
    return Object.assign({}, _.cloneDeep(this.config));
  }
}

Deployment.MODULE_AIRFLOW = "airflow";

module.exports = Deployment;