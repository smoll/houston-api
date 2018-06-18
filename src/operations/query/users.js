const BaseOperation = require("../base.js");

class Users extends BaseOperation {
  constructor() {
    super();
    this.name = "users";
    this.typeDef = `
      # Fetches a user by username, email
      users(userUuid: Uuid, identity: String) : [User]
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      let user = context.resources.user;
      return [user];
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = Users;
