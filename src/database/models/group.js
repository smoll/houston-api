const BaseModel = require("./base.js");
const CommonUtil = require("../../utils/common.js");

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
        team_uuid: { type: "uuid" },
        active: { type: "boolean" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "label", "description", "team_uud", "active"];
  }

  static get relationMappings() {
    return {
      role: {
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
    this.active = true;
    return super.$beforeInsert(context);
  }
}

module.exports = Group;