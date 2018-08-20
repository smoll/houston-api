const BaseType = require("./base.js");

class Workspace extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "Workspace";
    this.typeDef = `
    type Workspace {
      uuid: Uuid
      label: String
      description: String
      active: Boolean
      users: [User]
      groups: [Group]
      invites: [Invite]
      deploymentCount: Int
      createdAt: String
      updatedAt: String
    }`;
  }

  resolver() {
    return {
      uuid(value) {
        return value.uuid || null;
      },
      label(value) {
        return value.label || null;
      },
      description(value) {
        return value.description || null;
      },
      active(value) {
        return value.active === true
      },
      invites(value) {
        if (value.invites) {
          return value.invites
        }
        return this.service("invite_token").fetchInvitesByWorkspaceUuid(value.uuid);
      },
      users(value) {
        if (value.users) {
          return value.users
        }
        return this.service("user").fetchUsersByWorkspaceUuid(value.uuid);
      },
      groups(value) {
        if (value.groups) {
          return value.groups
        }
        return this.service("group").fetchGroupsByEntity(this.model("group").ENTITY_WORKSPACE, value.uuid);
      },
      deploymentCount(value) {
        return this.service("deployment").fetchDeploymentByWorkspaceUuid(value.uuid, false)
          .then(deployments => deployments.length)
      },
      createdAt(value) {
        return value.createdAt || null;
      },
      updatedAt(value) {
        return value.updatedAt || null;
      },
    };
  }
}

module.exports = Workspace;
