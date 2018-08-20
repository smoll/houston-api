const BaseModel = require("./base.js");

const Constants = require("../../constants.js");

class Role extends BaseModel {

  static get tableName() {
    return "roles";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["label", "category"],

      properties: {
        uuid: { type: "uuid" },
        label: { type: "string", minLength: 1, maxLength: 255 },
        category: { type: "string", minLength: 1, maxLength: 64 },
        entity_type: { type: "string", maxLength: 32 },
        entity_uuid: { type: "uuid" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "label", "category", "entity_type", "entity_uuid"];
  }

  static get relationMappings() {
    return {
      permissions: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: `${__dirname}/permission.js`,
        join: {
          from: 'roles.uuid',
          to: 'permissions.id',
          through: {
            model: `${__dirname}/role_permission_map.js`,
            from: `role_permission_map.role_uuid`,
            to: `role_permission_map.permission_id`
          },
        }
      },
      permission_ids: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/role_permission_map.js`,
        join: {
          from: 'roles.uuid',
          to: 'role_permission_map.role_uuid',
        }
      }
    };
  }
}

Role.ENTITY_GROUP = Constants.ENTITY_GROUP;
Role.ENTITY_SERVICE_ACCOUNT = Constants.ENTITY_SERVICE_ACCOUNT;

module.exports = Role;