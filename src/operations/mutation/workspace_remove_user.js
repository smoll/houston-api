const BaseOperation = require("../base.js");

class WorkspaceRemoveUser extends BaseOperation {
  constructor() {
    super();
    this.name = "workspaceRemoveUser";
    this.typeDef = `
      # Remove user from a workspace
      workspaceRemoveUser(workspaceUuid: Uuid!, userUuid: Uuid!) : Workspace
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated"];
    // this.guards = ["authenticated", "permission:user_workspace_user_remove"];
  }

  async resolver(root, args, context) {
    try {
      await this.service("workspace").removeUser(context.resources.workspace, context.resources.user);

      // refetch workspace
      return await this.service("workspace").fetchWorkspaceByUuid(context.resources.workspace.uuid, { relation: "users, groups, groups.users]" });
    } catch (err) {
      this.error(err);
      throw err;
    }
  }
}

module.exports = WorkspaceRemoveUser;
