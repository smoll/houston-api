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
      const workspace = await this.service("workspace").fetchWorkspaceByUuid(args.teamUuid);

      await this.service("workspace").deleteWorkspace(workspace);

      return {
        uuid: workspace.uuid
      }
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = DeleteTeam;
