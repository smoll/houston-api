const BaseOperation = require("../base.js");

class Self extends BaseOperation {
  constructor() {
    super();
    this.name = "self";
    this.typeDef = `
      # Fetches info about the authenticated requesting user
      self : User
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      let user = context.authUser;
      return user;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = Self;