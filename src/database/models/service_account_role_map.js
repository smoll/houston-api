const BaseModel = require("./base.js");

class ServiceAccountRole extends BaseModel {

  static get tableName() {
    return "service_account_role_map";
  }

  static get idColumn() {
    return ["service_account_uuid", "role_uuid"];
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["service_account_uuid", "role_uuid"],

      properties: {
        service_account_uuid: { type: "uuid" },
        role_uuid: { type: "uuid" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["service_account_uuid", "role_uuid"];
  }

  static get relationMappings() {
    return {
      service_account: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/service_account.js`,
        join: {
          from: 'service_account_role_map.service_account_uuid',
          to: 'service_accounts.uuid',
        }
      },
      role: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/role.js`,
        join: {
          from: 'service_account_role_map.role_uuid',
          to: 'roles.uuid',
        }
      },
    };
  }
}

module.exports = ServiceAccountRole;