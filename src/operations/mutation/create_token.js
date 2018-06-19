const BaseOperation = require("../base.js");

class CreateToken extends BaseOperation {
  constructor() {
    super();
    this.name = "createToken";
    this.typeDef = `
      # Verify a User's credentials and issues a token if valid. Adding an orgId validates a User's credentials 
      # and access to that Organization, failing if a User does not have access to that Organization.
      createToken(identity: String!, password: String!, teamUuid: String, permission: String, duration: Int) : AuthUser
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      let user = await this.service("auth").authenticateUser(args.identity, args.password);

      let tokenPayload = await this.service("auth").generateTokenPayload(user);
      let token = await this.service("auth").createJWT(tokenPayload, args.duration);

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
