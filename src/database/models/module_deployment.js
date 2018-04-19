const _ = require("lodash");
const BaseModel = require("./base.js");
const SoftDelete = require('objection-soft-delete')({
  columnName: "deleted_at"
});

class ModuleDeployment extends SoftDelete(BaseModel) {

  static get tableName() {
    return "module_deployments";
  }

  static get idColumn() {
    return "uuid";
  }

  static get uuidFields() {
    return ['uuid'];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["type", "title", "release_name", "version", "creator_uuid", "organization_uuid"],

      properties: {
        uuid: { type: "uuid" },
        type: { type: "string"},
        title: { type: "string", minLength: 1, maxLength: 255 },
        release_name: { type: "string", minLength: 1, maxLength: 128 },
        version: { type: "string" },
        creator_uuid: { type: "string" },
        organization_uuid: { type: ["string", "null"] }, // TODO: Once organizations are supported, ensure field is not nullable (add migration)
        team_uuid: { type: ["string", "null"] },
        config: { type: "object" }
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "type", "title", "release_name", "version", "creator_uuid", "team_uuid", "config", "created_at", "updated_at", "deleted_at"];
  }

  static get relationMappings() {
    return {
      creator: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'module_deployments.creator_uuid',
          to: 'users.uuid'
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