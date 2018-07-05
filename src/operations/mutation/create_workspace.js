const BaseOperation = require("../base.js");

class CreateTeam extends BaseOperation {
  constructor() {
    super();
    this.name = "createTeam";
    this.typeDef = `
      # Create a team and add authenticated user as owner
      createTeam(label: String!, description: String) : Team
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      const payload = {
        label: args.label,
        description: args.description
      };

      const workspace = await this.service("workspace").createWorkspaceWithDefaultGroups(context.authUser, payload);

      // TODO: Requerying so we know all associated data is there, lets ensure above function properly associates
      // users and groups with the new workspace object so we can just return it and delete the line below
      return await this.service("workspace").fetchWorkspaceByUuid(workspace.uuid, {relations: "[users, groups]"});
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = CreateTeam;
