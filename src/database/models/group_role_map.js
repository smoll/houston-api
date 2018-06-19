const BaseModel = require("./base.js");

class GroupRole extends BaseModel {

  static get tableName() {
    return "group_role_map";
  }

  static get idColumn() {
    return ["group_uuid", "role_uuid"];
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["group_uuid", "role_uuid"],

      properties: {
        group_uuid: { type: "uuid" },
        role_uuid: { type: "uuid" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["group_uuid", "role_uuid"];
  }

  static get relationMappings() {
    return {
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/group.js`,
        join: {
          from: 'group_role_map.group_uuid',
          to: 'groups.uuid',
        }
      },
      role: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/role.js`,
        join: {
          from: 'group_role_map.role_uuid',
          to: 'roles.uuid',
        }
      },
    };
  }
}

module.exports = GroupRole;