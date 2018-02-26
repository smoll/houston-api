const BaseOperation = require("../base.js");

class FetchUser extends BaseOperation {
  constructor() {
    super();
    this.name = "fetchUser";
    this.typeDef = `
      # Fetches are user by username or email
      fetchUser(search: String!) : [User]
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      let user = context.resources.user;

      return [user];
    } catch (err) {
      this.error(err.message);
      // TODO: Should throw error
      return [];
    }
  }
}

module.exports = FetchUser;
