const BaseOperation = require("../base.js");

class UpdateUser extends BaseOperation {
  constructor() {
    super();
    this.name = "updateUser";
    this.typeDef = `
      # Update an existing user
      updateUser(userId: String!, payload: JSON!) : User
    `;
    this.entrypoint = "mutation";
    this.quards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      let user = context.resources.user;
      let updated = await this.service("user").updateUser(user, args.payload);

      return updated;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = UpdateUser;
