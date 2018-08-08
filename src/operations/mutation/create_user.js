const BaseOperation = require("../base.js");

class CreateUser extends BaseOperation {
  constructor() {
    super();
    this.name = "createUser";
    this.typeDef = `
      # Creates a new user
      createUser(email: String!, password: String!, username: String, profile: JSON, inviteToken: String, duration: Int) : AuthUser
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      if (!args.profile) {
        args.profile = { fullName: null };
      }

      // ensure profile is an object
      const profile = Object.assign({}, args.profile);

      let user = await this.service("local_user").createUser(args.email, args.password, args.username, profile);
      
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
      this.error(err.message);
      throw err
    }
  }
}

module.exports = CreateUser;
