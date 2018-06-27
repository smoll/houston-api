const _ = require("lodash");
const BaseService = require("./base.js");

class TeamService extends BaseService {

  async fetchTeamByUuid(uuid, options = {}) {
    const team = await this.model("team")
      .query()
      .eager("users.emails", "groups")
      .findById(uuid);
    if (team) {
      return team;
    }
    if (throwError) {
      this.notFound("team", uuid);
    }
    return null;
  }

  async fetchTeamsByUserUuid(uuid) {
    const teams = await this.model("team")
      .query()
      .joinRelation("users")
      .eager("users.emails", "groups")
      .where("users_join.user_uuid", uuid);

    if (teams) {
      return teams;
    }
    return null;
  }

  async createTeam(user, payload, options = {}) {
    // TODO: Add label and description validation
    return await this.model("team").query(options.transaction || undefined).insertGraph({
      label: payload.label,
      description: payload.description,
      users: [
        {
          uuid: user.uuid,
          created_at: new Date().toISOString()
        },
      ]
    }, {
      relate: "users"
    }).returning("*");


  }

  async updateTeam(team, payload) {
    let changes = {};

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

  async addUser(team, user) {
    return this.model("user_team").query()
      .insertGraph({
        user_uuid: user.uuid,
        team_uuid: team.uuid,
      });
  }

  async removeUser(team, user) {
    return this.model("user_team").query()
      .deleteById([user.uuid, team.uuid]);
  }

  async deleteTeam(team) {
    return await team.$query().delete();
  }

  async deleteTeamByUuid(teamUuid) {
    return await this.model("team").query().deleteById(teamUuid);
  }
}

module.exports = TeamService;