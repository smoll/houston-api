const _ = require("lodash");
const BaseModel = require("./base.js");

class ModuleDeployment extends BaseModel {

  static get tableName() {
    return "module_deployments";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["type", "title", "release_name", "version", "organization_uuid"],

      properties: {
        uuid: { type: "uuid" },
        type: { type: "string"},
        title: { type: "string", minLength: 1, maxLength: 255 },
        release_name: { type: "string", minLength: 1, maxLength: 128 },
        version: { type: "string" },
        organization_uuid: { type: ["string", "null"] }, // TODO: Once organizations are supported, ensure field is not nullable (add migration)
        team_uuid: { type: ["string", "null"] },
        config: { type: "object" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "type", "title", "release_name", "version", "team_uuid", "config", "created_at", "updated_at"];
  }

  static get relationMappings() {
    return {
      team: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/team.js`,
        join: {
          from: 'module_deployments.team_uuid',
          to: 'teams.uuid'
        }
      }
    };
  }

  getConfigCopy() {
    return Object.assign({}, _.cloneDeep(this.config));
  }
}

ModuleDeployment.MODULE_AIRFLOW = "airflow";
ModuleDeployment.MODULE_CLICKSTREAM = "clickstream";

module.exports = ModuleDeployment;