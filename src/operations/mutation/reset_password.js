const BaseOperation = require("../base.js");

class ResetPassword extends BaseOperation {
  constructor() {
    super();
    this.name = "resetPassword";
    this.typeDef = `
      # Takes a password reset token and new password, updates password credentials, and authenticates user
      resetPassword(token: String!, password: String!, duration: Int) : AuthUser
    `;
    this.entrypoint = "mutation";
    this.guards = [];
  }

  async resolver(root, args, context) {
    try {
      const credentials = await this.service("local_user").fetchCredentialByResetToken(args.token);

      if (!credentials) {
        return this.notFound("local_credentials", args.token);
      }

      const user = await this.service("user").fetchUserByUuid(credentials.userUuid);

      await this.service("local_user").updatePassword(credentials, args.password);

      let tokenPayload = await this.service("auth").generateTokenPayload(user);
      let token = await this.service("auth").createJWT(tokenPayload, args.duration);

      this.service("auth").setAuthCookie(context.res, token, tokenPayload.exp);

      return {
        user: user,
        token: {
          value: token,
          payload: tokenPayload
        },

        // TODO Do a rbac lookup for the user
        permissions: {},
        isAdmin: false,
      }
    } catch (err) {
      this.error(err);
      throw err;
    }
  }
}

module.exports = ResetPassword;
