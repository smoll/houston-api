const BaseOperation = require("../base.js");

class Self extends BaseOperation {
  constructor() {
    super();
    this.name = "self";
    this.typeDef = `
      # Fetches info about the authenticated requesting user
      self : AuthUser
    `;
    this.entrypoint = "query";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      const session = context.session;
      const user = session.authUser;
      return {
        user: user,
        token: {
          value: session.authorization,
          payload: session.decoded,
        },
        permissions: session.permissions,
        isAdmin: session.isAdmin
      }
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = Self;
