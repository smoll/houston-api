const _ = require("lodash");

const BaseOperation = require("../base.js");

class WorkspaceAddUser extends BaseOperation {
  constructor() {
    super();
    this.name = "workspaceAddUser";
    this.typeDef = `
      # Add user to a workspace
      workspaceAddUser(workspaceUuid: Uuid!, email: String!, groupUuids: String) : Workspace
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated", "permission:user_workspace_user_add"];
  }

  async resolver(root, args, context) {
    try {
      let user = await this.service("user").fetchUserByEmail(args.email, false);
      let workspace = context.session.resources.workspace;

      let groupUuids = "";
      if (args.groupUuids) {
        groupUuids = args.groupUuids.split(",");
      }

      if (!user) {
        this.userNotFound(args.email);
        let invites = await this.service("invite_token").fetchInvitesByWorkspaceUuid(workspace.uuid);
        if (this.userInvited(invites, args.email)) {
          throw new Error("User already invited to group");
        }
        const assignments = {
          groupUuids: groupUuids
        };
        const invite = await this.service("invite_token").createInviteToken(args.email, workspace.uuid, assignments);
        invites.push(invite);
        workspace.invites = invites;
        return workspace;
      } else {
        await this.service("workspace").addUser(workspace, user);

        // TODO: Remove: temporary until RBAC is fully exposed
        //   add user to all workspace groups
        const groups = await this.service("group").fetchGroupsByWorkspaceUuid(workspace.uuid);
        const promises = [];
        for (let group of groups) {
          promises.push(this.service("group").addUser(group, user));
        }
        await Promise.all(promises);

        return await this.service("workspace").fetchWorkspaceByUuid(workspace.uuid, { relation: "users, groups, groups.users]" });
      }
    } catch (err) {
      this.error(err);
      throw err;
    }
  }

  userInvited(invites, email) {
    if (!invites || invites.length === 0) {
      return false;
    }
    for(let invite of invites) {
      if (invite.email === email) {
        return true;
      }
    }
    return false;
  }
}

module.exports = WorkspaceAddUser;
