const BaseOperation = require("../base.js");

class ForgotPassword extends BaseOperation {
  constructor() {
    super();
    this.name = "forgotPassword";
    this.typeDef = `
      # Trigger forgot password processs
      forgotPassword(email: String!) : Boolean
    `;
    this.entrypoint = "mutation";
    this.guards = [];
  }

  async resolver(root, args, context) {
    try {
      let user = await this.service("user").fetchUserByEmail(args.email);

      await this.service("user").forgotPassword(args.email, user);

      return true;
    } catch (err) {
      this.error(err);
      throw err;
    }
  }
}

module.exports = ForgotPassword;
