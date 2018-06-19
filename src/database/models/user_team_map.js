const BaseModel = require("./base.js");

class UserTeam extends BaseModel {

  static get tableName() {
    return "user_team_map";
  }

  static get idColumn() {
    return ["user_uuid", "team_uuid"];
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["user_uuid", "team_uuid"],

      properties: {
        user_uuid: { type: "uuid" },
        team_uuid: { type: "uuid" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["user_uuid", "team_uuid"];
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'user_team_map.user_uuid',
          to: 'users.uuid',
        }
      },
      team: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/team.js`,
        join: {
          from: 'user_team_map.team_uuid',
          to: 'teams.uuid',
        }
      },
    };
  }
}

module.exports = UserTeam;