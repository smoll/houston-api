const BaseModel = require("./base.js");

class TeamProperty extends BaseModel {

  static get tableName() {
    return "team_properties";
  }

  static get idColumn() {
    return ["team_uuid", "key"];
  }

  static get uuidFields() {
    return [];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["team_uuid", "key", "value"],

      properties: {
        team_uuid: { type: "uuid" },
        key: { type: "string" },
        value: { type: "string" },
        category: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["team_uuid", "key", "value", "category"];
  }

  static get relationMappings() {
    return {
      team: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/team.js`,
        join: {
          from: 'team_properties.team_uuid',
          to: 'teams.uuid',
        }
      },
    };
  }
}

module.exports = TeamProperty;