const { Model } = require("objection");
const SoftDelete = require('objection-soft-delete')({
  columnName: "deleted_at"
});

class ModuleDeployment extends SoftDelete(Model) {

  static get tableName() {
    return "module_deployments";
  }

  static get idColumn() {
    return "uuid";
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
        team_uuid: { type: ["string", "null"] }
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "type", "title", "release_name", "version", "creator_uuid", "team_uuid", "created_at", "updated_at", "deleted_at"];
  }

  static get relationMappings() {
    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'module_deployments.creator_uuid',
          to: 'users.uuid'
        }
      }
    };
  }
}

ModuleDeployment.MODULE_AIRFLOW = "airflow";
ModuleDeployment.MODULE_CLICKSTREAM = "clickstream";

module.exports = ModuleDeployment;