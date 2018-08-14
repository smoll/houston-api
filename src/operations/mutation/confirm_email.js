const BaseOperation = require("../base.js");

class ConfirmEmail extends BaseOperation {
  constructor() {
    super();
    this.name = "confirmEmail";
    this.typeDef = `
      # Confirm email added on signup or from the user profile page
      confirmEmail(token: String!, duration: Int) : AuthUser
    `;
    this.entrypoint = "mutation";
    this.guards = [];
  }

  async resolver(root, args, context) {
    try {
      const email = await this.service("email").fetchEmailByToken(args.token);

      if (!email) {
        return this.errors().GenericError("Email confirmation token invalid", {
          token: args.token
        });
      }

      if (email.verified) {
        return this.errors().GenericError("Email already confirmed", {
          token: args.token
        });
      }

      await this.service("email").updateVerification(email);

      let user = await this.service("user").fetchUserByUuid(email.userUuid);

      let tokenPayload = await this.service("auth").generateTokenPayload(user);
      let token = await this.service("auth").createJWT(tokenPayload, args.duration);

      this.service("auth").setAuthCookie(context.res, token, tokenPayload.exp);

      return {
        user: user,
        token: {
          value: token,
          payload: tokenPayload
        }
      }
    } catch (err) {
      this.error(err);
      throw err;
    }
  }
}

module.exports = ConfirmEmail;
