const BaseModel = require("./base.js");

class Team extends BaseModel {

  static get tableName() {
    return "teams";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["label"],

      properties: {
        uuid: { type: "uuid" },
        label: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: "string", minLength: 1, maxLength: 255 },
        active: { type: "boolean" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "label", "description", "active"];
  }

  static get relationMappings() {
    return {
      groups: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/group.js`,
        join: {
          from: 'teams.uuid',
          to: 'groups.team_uuid'
        }
      },
      users: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'teams.uuid',
          through: {
            model: `${__dirname}/user_team_map.js`,
            from: `user_team_map.team_uuid`,
            to: `user_team_map.user_uuid`
          },
          to: 'users.uuid',
        }
      },
    };
  }
}

module.exports = Team;
