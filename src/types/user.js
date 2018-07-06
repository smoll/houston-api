const BaseType = require("./base.js");
const _ = require("lodash");

class User extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "User";
    this.typeDef = `
    type User {
      uuid: Uuid
      emails: [Email]
      fullName: String
      username: String
      profile: [UserProperty]
      status: String
      createdAt: String
      updatedAt: String
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
      fullName(value) {
        return value.fullName || null;
      },
      username(value) {
        return value.username || null;
      },
      profile(value) {
        if (!value.properties) {
          console.log(value);
          return this.service("user").fetchUserPropertiesByUser(value);
        }
        return value.properties || [];
      },
      status(value) {
        return value.status || "unknown";
      },
      createdAt(value) {
        return value.createdAt || null;
      },
      updatedAt(value) {
        return value.updatedAt || null;
      }
    };
  }
}

module.exports = User;