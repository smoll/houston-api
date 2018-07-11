const BaseOperation = require("../base.js");

class UpdateWorkspace extends BaseOperation {
  constructor() {
    super();
    this.name = "updateWorkspace";
    this.typeDef = `
      # Update an existing workspace
      updateWorkspace(workspaceUuid: Uuid!, payload: JSON!) : Workspace
    `;
    this.entrypoint = "mutation";
    this.quards = ["authenticated", "permission:user_workspace_update"];
  }

  async resolver(root, args, context) {
    try {
      return await this.service("workspace").updateWorkspace(context.resources.workspace, args.payload);
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = UpdateWorkspace;
