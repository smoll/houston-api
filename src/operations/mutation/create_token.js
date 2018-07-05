const BaseOperation = require("../base.js");

class CreateToken extends BaseOperation {
  constructor() {
    super();
    this.name = "createToken";
    this.typeDef = `
      # Verify a User's credentials and issues a token if valid. Adding an orgId validates a User's credentials 
      # and access to that Organization, failing if a User does not have access to that Organization.
      createToken(credentials: String!, identity: String, authStrategy: AuthStrategy, teamUuid: String, permission: String, duration: Int) : AuthUser
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      if (!args.authStrategy) {
        args.authStrategy = this.service("auth").defaultStrategy();
      }
      let strategy = args.authStrategy.toLowerCase();

      if (!this.service("auth").isStrategy(strategy)) {
        return new Error("Unknown auth strategy");
      }

      let user = null;
      if (this.service("auth").isOAuthStrategy(strategy)) {
        try {
          user = await this.service("auth").authenticateOAuth(strategy, args.credentials);
        } catch (err) {
          console.log(err);
          throw err;
        }
      } else {
        user = await this.service("auth").authenticateUser(args.identity, args.credentials);
      }

      if (!user) {
        throw new Error("Unable to find user");
      }

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
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = CreateToken;
