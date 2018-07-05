const BaseType = require("./base.js");

class Team extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "Team";
    this.typeDef = `
    type Team {
      uuid: Uuid
      label: String
      description: String
      active: Boolean
      users: [User]
      groups: [Group]
      invites: [Invite]
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
        return this.service("group").fetchGroupsByEntityUuid(this.model("group").ENTITY_WORKSPACE,value.uuid);
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

module.exports = Team;