const BaseOperation = require("../base.js");

class CreateUser extends BaseOperation {
  constructor() {
    super();
    this.name = "createUser";
    this.typeDef = `
      # Creates a new user
      createUser(email: String!, password: String!, profile: JSON) : Token
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      let user = await this.service("user").createUser(args.email, args.password);
      let tokenPayload = await this.service("auth").generateTokenPayload(user);
      let token = await this.service("auth").createJWT(tokenPayload, args.duration);

      return {
        success: true,
        message: "User created, token created",
        token: token,
        decoded: tokenPayload
      }
    } catch (err) {
      return {
        success: false,
        message: err,
        token: null,
        decoded: {}
      }
    }
  }
}

module.exports = CreateUser;
