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
      let teams;
      if (args.teamUuid) {
        return [context.resources.team];
      } else {
        if (!args.userUuid) {
          args.userUuid = context.authUser.uuid;
        }
        teams = await this.service("team").fetchTeamsByUserUuid(args.userUuid);
      }
      return teams;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = Teams;
