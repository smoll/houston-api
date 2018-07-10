const BaseType = require("./base.js");

class Group extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "Group";
    this.typeDef = `
    type Group {
      uuid: Uuid
      label: String
      description: String
      workspace: Workspace
      custom: Boolean
      active: Boolean
      users: [User]
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
      workspace(value) {
        return value.workspace || null;
      },
      custom(value) {
        return value.custom === true
      },
      active(value) {
        return value.active === true
      },
      users(value) {
        if (value.users) {
          return value.users;
        }
        return this.service("user").fetchUsersByGroupUuid(values.uuid);
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

module.exports = Group;