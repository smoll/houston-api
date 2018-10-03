const BaseOperation = require("../base.js");

class Invites extends BaseOperation {
  constructor() {
    super();
    this.name = "invites";
    this.typeDef = `
      # Fetch a list of invites
      invites(workspaceUuid: Uuid, email: String) : [Invite]
    `;
    this.entrypoint = "query";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, { session }) {
    if (!args.workspaceUuid) {
      if(!session.hasPermissions("global_user_invite")) {
        return this.notAuthorized("Cannot list platform level invites");
      }
      return this.service("invite_token").fetchInvitesByWorkspaceUuid();
    } else {
      if(!session.hasPermissions([["user_workspace_user_list", "global_user_invite"]])) {
        return this.notAuthorized("Cannot list invites for this workspace");
      }
      return this.service("invite_token").fetchInvitesByWorkspaceUuid(args.workspaceUuid, args.email);
    }
  }
}

module.exports = Invites;
