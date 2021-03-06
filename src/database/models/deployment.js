const _ = require("lodash");
const BaseModel = require("./base.js");
const Constants = require("../../constants.js");

const Password = require('objection-password-bcryptjs')({
  allowEmptyPassword: true,
  passwordField: "registryPassword",
  rounds: 10
});

class Deployment extends Password(BaseModel) {

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
        description: { type: "string", minLength: 1, maxLength: 255 },
        release_name: { type: "string", minLength: 1, maxLength: 128 },
        registry_password: { type: "string" },
        version: { type: "string" },
        workspace_uuid: { type: ["string"] },
        status: { type: "string" },
        config: { type: "object" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "type", "label", "description", "release_name", "version", "workspace_uuid", "config", "created_at", "updated_at"];
  }

  static get relationMappings() {
    return {
      workspace: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/workspace.js`,
        join: {
          from: "deployments.workspace_uuid",
          to: "workspaces.uuid"
        }
      },
      groups: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/group.js`,
        filter: {
          "entity_type": Constants.ENTITY_DEPLOYMENT,
        },
        join: {
          from: "deployments.uuid",
          to: "groups.entity_uuid"
        }
      },
      constraint: {
        relation: BaseModel.HasOneRelation,
        modelClass: `${__dirname}/deployment_constraint.js`,
        filter: {
          "entity_type": Constants.ENTITY_WORKSPACE,
        },
        join: {
          from: "deployments.workspace_uuid",
          to: "deployment_constraints.entity_uuid"
        }
      }
    };
  }

  getConfigCopy() {
    return Object.assign({}, _.cloneDeep(this.config));
  }

  $beforeInsert(context) {
    if (!this.status) {
      this.status = Deployment.STATUS_ACTIVE;
    }
    return super.$beforeInsert(context);
  }

}

Deployment.MODULE_AIRFLOW = "airflow";
Deployment.STATUS_ACTIVE = "active";
Deployment.STATUS_DELETING = "deleting";

module.exports = Deployment;
