const BaseType = require("./base.js");

class User extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "User";
    this.typeDef = `
    type User {
      uuid: Uuid
      emails: [Email]
      profile: JSON
      username: String
      status: String
      created_at: String
      updated_at: String
    }`;
  }

  resolver() {
    return {
      uuid(value) {
        return value.uuid || null;
      },
      emails(value) {
        return value.emails || [];
      },
      profile(value) {
        return value.profile || {};
      },
      username(value) {
        return value.username || null;
      },
      status(value) {
        return value.status || "unknown";
      },
      created_at(value) {
        return value.createdAt || null;
      },
      updated_at(value) {
        return value.updatedAt || null;
      }
    };
  }
}

module.exports = User;