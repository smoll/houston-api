const BaseOperation = require("../base.js");

class Workspaces extends BaseOperation {
  constructor() {
    super();
    this.name = "workspaces";
    this.typeDef = `
      # Fetch workspace by userUuid, workspaceUuid, or
      workspaces(userUuid: Uuid, workspaceUuid: Uuid) : [Workspace]
    `;
    this.entrypoint = "query";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      if (args.workspaceUuid) {
        return [context.resources.workspace];
      } else {
        if (!args.userUuid) {
          args.userUuid = context.authUser.uuid;
        }
        return await this.service("workspace").fetchWorkspacesByUserUuid(args.userUuid);
      }
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = Workspaces;
