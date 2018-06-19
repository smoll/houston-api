const BaseOperation = require("../base.js");

class DeleteTeam extends BaseOperation {
  constructor() {
    super();
    this.name = "deleteTeam";
    this.typeDef = `
      # Deletes an existing team
      deleteTeam(teamUuid: Uuid) : Team
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      const team = await this.service("team").fetchTeamByUuid(args.teamUuid);

      if (!team) {
        throw new Error("Team not found");
      }

      await this.service("team").deleteTeam(team);

      return {
        uuid: team.uuid
      }
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = DeleteTeam;
