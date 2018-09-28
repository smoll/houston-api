const Transaction = require('objection').transaction;

const BaseOperation = require("../base.js");

class CreateWorkspace extends BaseOperation {
  constructor() {
    super();
    this.name = "createWorkspace";
    this.typeDef = `
      # Create a workspace and add authenticated user as owner
      createWorkspace(label: String!, description: String) : Workspace
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated", "permission:user_workspace_create"];
  }

  async resolver(root, args, context) {
    try {
      const payload = {
        label: args.label,
        description: args.description
      };

      return await Transaction(this.conn("postgres"), async (trx) => {
        const workspace = await this.service("workspace").createWorkspaceWithDefaultGroups(context.session.authUser, payload, {
          transaction: trx,
        });

        // TODO: Requerying so we know all associated data is there, lets ensure above function properly associates
        // users and groups with the new workspace object so we can just return it and delete the line below
        return await this.service("workspace").fetchWorkspaceByUuid(workspace.uuid, {
          relations: "[users, groups]"
        });
      });
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = CreateWorkspace;
