const BaseOperation = require("../base.js");

class TeamRemoveUser extends BaseOperation {
  constructor() {
    super();
    this.name = "teamRemoveUser";
    this.typeDef = `
      # Remove user from a team
      teamRemoveUser(teamUuid: Uuid!, userUuid: Uuid!) : Team
    `;
    this.entrypoint = "mutation";
   // this.guards = ["authenticated", "permission:user_team_user_remove"];
  }

  async resolver(root, args, context) {
    try {
      const user = await this.service("user").fetchUserByUuid(args.userUuid);
      const team = await this.service("team").fetchTeamByUuid(args.teamUuid);
      await this.service("team").removeUser(team, user);

      // refetch team
      return await this.service("team").fetchTeamByUuid(team.uuid, { relation: "users, groups, groups.users]" });
    } catch (err) {
      this.error(err);
      throw err;
    }
  }
}

module.exports = TeamRemoveUser;
