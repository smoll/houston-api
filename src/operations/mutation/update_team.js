const BaseOperation = require("../base.js");

class UpdateTeam extends BaseOperation {
  constructor() {
    super();
    this.name = "updateTeam";
    this.typeDef = `
      # Update an existing team
      updateTeam(teamUuid: Uuid!, payload: JSON!) : Team
    `;
    this.entrypoint = "mutation";
    this.quards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      let team = await this.service("team").fetchTeamByUuid(args.teamUuid);

      if (!team) {
        throw new Error("Team not found");
      }

      let updatedTeam = await this.service("team").updateTeam(team, args.payload);
      return updatedTeam;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = UpdateTeam;
