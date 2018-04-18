const BaseOperation = require("../base.js");

class UpdateUser extends BaseOperation {
  constructor() {
    super();
    this.name = "updateUser";
    this.typeDef = `
      # Update an existing user
      updateUser(userId: String!, payload: JSON!) : StatusMessage
    `;
    this.entrypoint = "mutation";
    this.quards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      let user = context.resources.user;
      let updated = await this.service("user").updateUser(user, args.payload);

      return {
        success: true,
        message: updated !== false ? "User updated" : "No changes, user unchanged",
        code: null,
        id: user.uuid
      }
    } catch (err) {
      this.error(err.message);
      return {
        success: false,
        message: "Error updating user",
        code: null,
        id: user.uuid
      }
    }
  }
}

module.exports = UpdateUser;
