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
      await this.service("workspace").removeUser(context.resources.team, context.resources.user);

      // refetch team
      return await this.service("workspace").fetchWorkspaceByUuid(context.resources.team.uuid, { relation: "users, groups, groups.users]" });
    } catch (err) {
      this.error(err);
      throw err;
    }
  }
}

module.exports = TeamRemoveUser;
