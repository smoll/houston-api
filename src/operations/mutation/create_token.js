const BaseOperation = require("../base.js");

const ApolloError = require("apollo-errors");

class CreateToken extends BaseOperation {
  constructor() {
    super();
    this.name = "createToken";
    this.typeDef = `
      # Verify a User's credentials and issues a token if valid. Adding an orgId validates a User's credentials 
      # and access to that Organization, failing if a User does not have access to that Organization.
      createToken(password: String!, identity: String, workspaceUuid: String, permission: String, duration: Int) : AuthUser
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      let user;
      try {
        user = await this.service("auth").authenticateUser(args.identity, args.credentials);
        if (!user) {
          throw new Error("Unable to find user");
        }
      } catch (err) {
        if (ApolloError.isInstance(err)) {
          return err;
        }
        return this.invalidInput([err.message]);
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
