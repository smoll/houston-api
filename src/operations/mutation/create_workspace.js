const Transaction = require('objection').transaction;

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
      // Determine default workspace groups
      const DEFAULT_GROUPS_KEY = this.model("system_setting").KEY_DEFAULT_WORKSPACE_GROUPS;
      let groupTemplates = await this.service("system_setting").getSetting(DEFAULT_GROUPS_KEY);
      if (groupTemplates && groupTemplates.length > 0) {
        groupTemplates = groupTemplates.split(",");
      } else {
        groupTemplates = [];
      }

      let workspace = await Transaction(this.conn("postgres"), async (trx) => {
        const payload = {
          label: args.label,
          description: args.description
        };
        const options = {
          transaction: trx
        };

        const workspace = await this.service("workspace").createWorkspace(context.authUser, payload, options);

        await this.service("group").createGroupsFromTemplates(this.model("group").ENTITY_WORKSPACE, workspace.uuid, groupTemplates, options);
        return workspace;
      });

      return await this.service("workspace").fetchWorkspaceByUuid(workspace.uuid, {relations: "[users, groups]"});
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = CreateTeam;
