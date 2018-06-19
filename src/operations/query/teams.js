const BaseOperation = require("../base.js");

class Teams extends BaseOperation {
  constructor() {
    super();
    this.name = "teams";
    this.typeDef = `
      # Fetch team by userUuid, teamUuid, or 
      teams(userUuid: String, teamUuid: String) : [Team]
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      let teams;
      if (args.teamUuid) {
        teams = this.service("team").fetchTeamByUuid(args.teamUuid, {
          relations: ["users"],
        });
      } else {
        if (!args.userUuid) {
          args.userUuid = context.authUser.uuid;
        }
        teams = this.service("team").fetchTeamsByUserUuid(args.userUuid, {
          relations: ["users"],
        });
      }
      return teams;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = Teams;
