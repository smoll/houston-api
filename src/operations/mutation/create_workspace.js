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

      const workspace = await Transaction(this.conn("postgres"), async (trx) => {
        return await this.service("workspace").createWorkspaceWithDefaultGroups(context.session.authUser, payload, {
          transaction: trx,
        });
      });

      return await this.service("workspace").fetchWorkspaceByUuid(workspace.uuid, {
        relations: "[users, groups]"
      });
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = CreateWorkspace;
