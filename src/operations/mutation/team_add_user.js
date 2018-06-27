const BaseOperation = require("../base.js");

class TeamAddUser extends BaseOperation {
  constructor() {
    super();
    this.name = "teamAddUser";
    this.typeDef = `
      # Add user to a team
      teamAddUser(teamUuid: Uuid!, email: String!) : Team
    `;
    this.entrypoint = "mutation";
    // this.guards = ["authenticated", "permission:user_team_user_add"];
  }

  async resolver(root, args, context) {
    try {
      let user = await this.service("user").fetchUserByEmail(args.email);
      let team = await this.service("team").fetchTeamByUuid(args.teamUuid);
      await this.service("team").addUser(team, user);

      // refetch team
      return await this.service("team").fetchTeamByUuid(team.uuid, { relation: "users, groups, groups.users]" });
    } catch (err) {
      this.error(err);
      throw err;
    }
  }
}

module.exports = TeamAddUser;
