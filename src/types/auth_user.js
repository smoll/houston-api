const BaseType = require("./base.js");

class AuthUser extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "AuthUser";
    this.typeDef = `
    type AuthUser {
      user: User
      token: Token
    }`;
  }

  resolver() {
    return {
      user(value) {
        return value.user || null;
      },
      token(value) {
        return value.token || null;
      }
    };
  }
}

module.exports = AuthUser;