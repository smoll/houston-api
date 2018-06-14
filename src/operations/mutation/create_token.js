const BaseOperation = require("../base.js");
const BasicAuthUtil = require("../../utils/basic_auth.js");
class CreateToken extends BaseOperation {
  constructor() {
    super();
    this.name = "createToken";
    this.typeDef = `
      # Verify a User's credentials and issues a token if valid. Adding an orgId validates a User's credentials and access to that Organization, failing if a User does not have access to that Organization.
      createToken(identity: String!, password: String!, orgId: String, permission: String, duration: Int): Token
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      // BASIC AUTH START
      /* Temporary until we replace basic auth */
      let username  = await BasicAuthUtil.ValidateCreds(args.identity, args.password);
      let user = await this.service("user").fetchUserByUsername(username);
      if (!user) {
        let UserModel = this.application.model("user");
        user = await UserModel
          .query()
          .insertGraph({
            username: username,
            provider_type: UserModel.PROVIDER_BASIC,
            provider_id: username,
          }).returning("*");
      }
      // BASIC AUTH END

      /* Uncomment when basic auth above is removed */
      //let user = await this.service("auth").authenticateUser(args.identity, args.password);

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
