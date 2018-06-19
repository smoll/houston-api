const BaseModel = require("./base.js");

class RolePermission extends BaseModel {

  static get tableName() {
    return "role_permission_map";
  }

  static get idColumn() {
    return ["role_uuid", "permission_id"];
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["role_uuid", "permission_id"],

      properties: {
        role_uuid: { type: "uuid" },
        permission_id: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["role_uuid", "permission_uuid"];
  }

  static get relationMappings() {
    return {
      role: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/role.js`,
        join: {
          from: 'role_permission_map.role_uuid',
          to: 'roles.uuid',
        }
      },
      permission: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/permission.js`,
        join: {
          from: 'role_permission_map.permission_id',
          to: 'permissions.id',
        }
      }
    };
  }
}

module.exports = RolePermission;