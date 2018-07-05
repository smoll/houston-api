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
      return await this.service("workspace").updateWorkspace(context.resources.team, args.payload);
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = UpdateTeam;
