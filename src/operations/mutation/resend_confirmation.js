const BaseOperation = require("../base.js");

const ApolloError = require("apollo-errors");

class ResendConfirmationEmail extends BaseOperation {
  constructor() {
    super();
    this.name = "resendConfirmation";
    this.typeDef = `
      # Confirm email added on signup or from the user profile page
      resendConfirmation(email: String!) : Boolean
    `;
    this.entrypoint = "mutation";
    this.guards = [];
  }

  async resolver(root, args, context) {
    try {
      const email = await this.service("email").fetchEmailByAddress(args.email);

      if (email.verified) {
        ApolloError.GenericError("Email already confirmed", {
          token: args.token
        });
      }
      await this.service("email").resendConfirmation(email);

      return true
    } catch (err) {
      this.error(err);
      throw err;
    }
  }
}

module.exports = ResendConfirmationEmail;
