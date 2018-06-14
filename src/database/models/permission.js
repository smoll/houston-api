const BaseModel = require("./base.js");

class Permission extends BaseModel {

  static get tableName() {
    return "permissions";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["label", "scope", "category"],

      properties: {
        uuid: { type: "uuid" },
        label: { type: "string", minLength: 1, maxLength: 255 },
        scope: { type: "string", minLength: 1, maxLength: 16 },
        category: { type: "string", minLength: 1, maxLength: 64 },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "label", "scope", "category"];
  }

  static get relationMappings() {
    return {
      role: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: `${__dirname}/role.js`,
        join: {
          from: 'permissions.uuid',
          to: 'roles.uuid',
          through: {
            model: `${__dirname}/role_permission_map.js`,
            from: `role_permission_map.permission_uuid`,
            to: `role_permission_map.role_uuid`
          },
        }
      }
    };
  }
}

module.exports = Permission;