const BaseOperation = require("../base.js");

const ApolloError = require("apollo-errors");

class ConfirmEmail extends BaseOperation {
  constructor() {
    super();
    this.name = "confirmEmail";
    this.typeDef = `
      # Confirm email added on signup or from the user profile page
      confirmEmail(email: String!, token: String!) : User
    `;
    this.entrypoint = "mutation";
    this.guards = [];
  }

  async resolver(root, args, context) {
    try {
      const email = await this.service("email").fetchEmailByAddress(args.email);

      if (!email.verified) {
        if (email.token !== args.token) {
          ApolloError.GenericError("Email confirmation token invalid", {
            token: args.token
          });
        }
        await this.service("email").updateVerification(email);
      }

      return await this.service("user").fetchUserByUuid(email.userUuid);
    } catch (err) {
      this.error(err);
      throw err;
    }
  }
}

module.exports = ConfirmEmail;
