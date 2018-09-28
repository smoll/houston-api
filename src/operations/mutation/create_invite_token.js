const BaseOperation = require("../base.js");
const _ = require("lodash");
const ApolloError = require("apollo-errors");

class CreateInviteToken extends BaseOperation {
  constructor() {
    super();
    this.name = "createInviteToken";
    this.typeDef = `
      # Invite a user into the platform
      createInviteToken(email: String!) : Invite
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated", "permission:global_user_invite"];
  }

  async resolver(root, args, context) {
    const user = await this.service("user").fetchUserByEmail(args.email, false);

    if (user) {
      throw new Error("Cannot create an invite token for a user that already exists");
    }

    // create a new token
    return this.service("invite_token").createInviteToken(args.email);
  }
}

module.exports = CreateInviteToken;
