const BaseModel = require("./base.js");

const Constants = require("../../constants.js");

class DeploymentConstraint extends BaseModel {

  static get tableName() {
    return "deployment_constraints";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["entity_type", "entity_uuid", "defaults", "limits"],

      properties: {
        uuid: { type: "uuid" },
        entity_uuid: { type: "uuid" },
        entity_type: { type: "string" },
        defaults: { type: "object" },
        limits: { type: "object" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "entity_uuid", "entity_type", "defaults", "limits"];
  }

  $beforeInsert(context) {
    return super.$beforeInsert(context);
  }
}

DeploymentConstraint.ENTITY_SYSTEM = Constants.ENTITY_SYSTEM;
DeploymentConstraint.ENTITY_WORKSPACE = Constants.ENTITY_WORKSPACE;

module.exports = DeploymentConstraint;