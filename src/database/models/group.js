const BaseModel = require("./base.js");

const Constants = require("../../constants.js");

class Group extends BaseModel {

  static get tableName() {
    return "groups";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["label", "description"],

      properties: {
        uuid: { type: "uuid" },
        label: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: "string", minLength: 1, maxLength: 255 },
        entity_uuid: { type: "uuid" },
        entity_type: { type: "string" },
        custom: { type: "boolean" },
        active: { type: "boolean" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "label", "description", "entity_uuid", "entity_type", "custom", "active"];
  }

  static get relationMappings() {
    return {
      roles: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: `${__dirname}/role.js`,
        join: {
          from: 'groups.uuid',
          to: 'roles.uuid',
          through: {
            model: `${__dirname}/group_role_map.js`,
            from: `group_role_map.group_uuid`,
            to: `group_role_map.role_uuid`
          },
        }
      },
      group_roles: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/group_role_map.js`,
        join: {
          from: 'groups.uuid',
          to: 'group_role_map.group_uuid',
        }
      },
      users: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'groups.uuid',
          to: 'users.uuid',
          through: {
            model: `${__dirname}/user_group_map.js`,
            from: `user_group_map.group_uuid`,
            to: `user_group_map.user_uuid`
          },
        }
      },
      properties: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/group_property.js`,
        join: {
          from: 'groups.uuid',
          to: 'group_properties.group_uuid',
        }
      }
    };
  }

  $beforeInsert(context) {
    this.custom = false;
    this.active = true;
    return super.$beforeInsert(context);
  }
}

Group.ENTITY_SYSTEM = Constants.ENTITY_SYSTEM;
Group.ENTITY_WORKSPACE = Constants.ENTITY_WORKSPACE;
Group.ENTITY_DEPLOYMENT = Constants.ENTITY_DEPLOYMENT;

module.exports = Group;