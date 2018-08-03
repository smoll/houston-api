const BaseType = require("./base.js");

class Invite extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "Invite";
    this.typeDef = `
    type Invite {
      uuid: Uuid
      email: String
      assignments: Boolean
      createdAt: String
      updatedAt: String
    }`;
  }

  resolver() {
    return {
      uuid(value) {
        return value.uuid || null;
      },
      email(value) {
        return value.email || null;
      },
      assignments(value) {
        return value.assignments || null;
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

module.exports = Invite;