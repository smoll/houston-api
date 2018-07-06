const BaseOperation = require("../base.js");

class DeleteWorkspace extends BaseOperation {
  constructor() {
    super();
    this.name = "deleteWorkspace";
    this.typeDef = `
      # Deletes an existing workspace
      deleteWorkspace(workspaceUuid: Uuid) : Workspace
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      const workspace = context.resources.workspace;

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

module.exports = DeleteWorkspace;
