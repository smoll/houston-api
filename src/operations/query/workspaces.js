const BaseOperation = require("../base.js");

class Teams extends BaseOperation {
  constructor() {
    super();
    this.name = "teams";
    this.typeDef = `
      # Fetch team by userUuid, teamUuid, or
      teams(userUuid: Uuid, teamUuid: Uuid) : [Team]
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      let workspaces;
      if (args.teamUuid) {
        return [context.resources.team];
      } else {
        if (!args.userUuid) {
          args.userUuid = context.authUser.uuid;
        }
        workspaces = await this.service("workspace").fetchWorkspacesByUserUuid(args.userUuid);
      }
      return workspaces;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = Teams;
