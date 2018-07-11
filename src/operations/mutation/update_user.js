const BaseOperation = require("../base.js");

class UpdateUser extends BaseOperation {
  constructor() {
    super();
    this.name = "updateUser";
    this.typeDef = `
      # Update an existing user
      updateUser(userId: Uuid, payload: JSON!) : User
    `;
    this.entrypoint = "mutation";
    this.quards = ["authenticated", "permission:user_user_update"];
  }

  async resolver(root, args, context) {
    try {
      let user = context.authUser;
      if (args.userUuid) {
        user = context.resources.user;
      }
      await this.service("user").updateUser(user, args.payload);

      // TODO: Update
      return await this.service("user").fetchUserByUuid(user.uuid);
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = UpdateUser;
