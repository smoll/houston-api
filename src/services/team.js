const _ = require("lodash");
const BaseService = require("./base.js");

class TeamService extends BaseService {

  async fetchTeamByUuid(uuid, options = {}) {
    const team = await this.model("team")
      .query()
      .eager(options.relations)
      .findById(uuid);
    if (team) {
      return [team];
    }
    return null;
  }

  async fetchTeamsByUserUuid(uuid, options = {}) {
    console.log("FetchTeamsByUserUuid");
    const teams = await this.model("team")
      .query()
      .eager(options.relations)
      .joinEager("users")
      .where("users.uuid", uuid);

    console.log(teams);
    if (teams) {
      return teams;
    }
    return null;
  }

  async createTeam(user, payload, options = {}) {
    console.log(arguments);
    // TODO: Add label and description validation
    return await this.model("team").query(options.transaction || undefined).insertGraph([{
      label: payload.label,
      description: payload.description,
      users: [
        {
          uuid: user.uuid,
        },
      ]
    }], {
      relate: "users"
    }).returning("*");
  }

  async updateTeam(team, payload) {
    let changes = {};

    console.log(arguments);

    // TODO: Do this check in a more extendable way
    if (payload["label"] !== undefined && payload.label !== team.label) {
      changes.label = payload.label;
    }
    if (payload["description"] !== undefined && payload.description !== team.description) {
      changes.description = payload.description;
    }

    if(Object.keys(changes).length === 0) {
      return false;
    }

    await team.$query().patch(changes).returning("*");
    return team;
  }

  async deleteTeam(team) {
    return await team.$query().delete();
  }

  async deleteTeamByUuid(teamUuid) {
    return await this.model("team").query().deleteById(teamUuid);
  }
}

module.exports = TeamService;
