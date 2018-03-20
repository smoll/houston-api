const BaseOperation = require("../base.js");

class CreateToken extends BaseOperation {
  constructor() {
    super();
    this.name = "createToken";
    this.typeDef = `
      # Verify a User's credentials and issues a token if valid. Adding an orgId validates a User's credentials and access to that Organization, failing if a User does not have access to that Organization.
      createToken(username: String!, password: String!, orgId: String, permission: String, duration: Int): Token
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      // return this.service("auth").createUser(args.email, args.email, args.password);
      let user = await this.service("auth").authenticateUser(args.username, args.password);
      let tokenPayload = await this.service("auth").generateTokenPayload(user);
      let token = await this.service("auth").createJWT(tokenPayload, args.duration);

      return {
        success: true,
        message: "Valid Credentials, Token Created",
        token: token,
        decoded: tokenPayload
      }
    } catch(err) {
      this.error(err);

      return {
        success: false,
        message: err,
        token: null,
        decoded: {}
      }
    }
  }
}

module.exports = CreateToken;