const BaseOperation = require("../base.js");

class WorkspaceRemoveUser extends BaseOperation {
  constructor() {
    super();
    this.name = "workspaceRemoveUser";
    this.typeDef = `
      # Remove user from a workspace
      workspaceRemoveUser(workspaceUuid: Uuid!, userUuid: Uuid, email: String) : Workspace
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated", "permission:user_workspace_user_remove"];
  }

  async resolver(root, args, context) {
    try {
      if (!args.userUuid && !args.email) {
        this.invalidInput("Either userUuid or email is required");
      }
      if (args.userUuid && args.email) {
        this.invalidInput("Cannot process request with both a userUuid & email");
      }

      let user = context.session.resources.user;
      if (args.email) {
        user = this.service("user").fetchUserByEmail(args.email);
      }

      await this.service("workspace").removeUser(context.session.resources.workspace, user);

      const groups = await this.service("group").fetchGroupsByWorkspaceUuid(context.session.resources.workspace.uuid);
      const promises = [];
      for (let group of groups) {
        promises.push(this.service("group").removeUser(group, user));
      }
      await Promise.all(promises);

      // refetch workspace
      return await this.service("workspace").fetchWorkspaceByUuid(context.session.resources.workspace.uuid, { relation: "users, groups, groups.users]" });
    } catch (err) {
      this.error(err);
      throw err;
    }
  }
}

module.exports = WorkspaceRemoveUser;
