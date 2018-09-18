const BaseModel = require("./base.js");
const CommonUtil = require("../../utils/common.js");

const Constants = require("../../constants.js");

class ServiceAccount extends BaseModel {

  static get tableName() {
    return "service_accounts";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["label", "entityType"],

      properties: {
        uuid: { type: "uuid" },
        api_key: { type: "string", minLength: 1, maxLength: 64 },
        label: { type: "string", minLength: 1, maxLength: 255 },
        category: { type: "string", minLength: 1, maxLength: 255 },
        entity_type: { type: "string", minLength: 1, maxLength: 32 },
        entity_uuid: { type: "uuid" },
        active: { type: "boolean" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "label", "category", "entity_type", "entity_uuid", "active"];
  }

  static get relationMappings() {
    return {
      roles: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: `${__dirname}/role.js`,
        join: {
          from: 'service_accounts.uuid',
          to: 'roles.uuid',
          through: {
            model: `${__dirname}/service_account_role_map.js`,
            from: `service_account_role_map.service_account_uuid`,
            to: `service_account_role_map.role_uuid`
          },
        }
      },
      service_account_roles: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/service_account_role_map.js`,
        join: {
          from: 'service_accounts.uuid',
          to: 'service_account_role_map.service_account_uuid',
        }
      },
    };
  }

  $beforeInsert(context) {
    return CommonUtil.randomToken(32).then((token) => {
      this.active = true;
      this.apiKey = token;
      return super.$beforeInsert(context);
    });
  }
}

ServiceAccount.ENTITY_GROUP = Constants.ENTITY_GROUP;
ServiceAccount.ENTITY_WORKSPACE = Constants.ENTITY_WORKSPACE;
ServiceAccount.ENTITY_SYSTEM = Constants.ENTITY_SYSTEM;

module.exports = ServiceAccount;