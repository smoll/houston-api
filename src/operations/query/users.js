const BaseOperation = require("../base.js");

class Users extends BaseOperation {
  constructor() {
    super();
    this.name = "users";
    this.typeDef = `
      # Fetches a user by username, email
      users(userUuid: Uuid, username: String, email: String) : [User]
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    if (args.userUuid) {
      return [this.service("user").fetchUserByUuid(args.userUuid)];
    } else if (args.username) {
      return [this.service("user").fetchUserByUsername(args.username)];
    } else if (args.email) {
      return [this.service("user").fetchUserByEmail(args.email)];
    } else {
      try {
        let user = context.resources.user;
        return [user];
      } catch (err) {
        this.error(err.message);
        throw err;
      }
    }
  }
}

module.exports = Users;
