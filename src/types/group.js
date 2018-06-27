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
      team: Team
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
        return value.label || false;
      },
      description(value) {
        return value.description || null;
      },
      team(value) {
        return value.team || null;
      },
      custom(value) {
        return value.custom === true
      },
      active(value) {
        return value.active === true
      },
      users(value) {
        return value.users || [];
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