const BaseOperation = require("../base.js");


class AuthConfig extends BaseOperation {
  constructor() {
    super();
    this.name = "authConfig";
    this.typeDef = `
      # Fetch configuration information about available authentication methods
      # 'state' is deprecated
      authConfig(redirect: String, duration: Int, extras: JSON, state: String, inviteToken: String) : AuthConfig
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      let state;
      if (args.state) {
        state = {
          redirect: "/token",
          extras: {
            source: "cli"
          }
        }
      } else {
        state = {
          redirect: args.redirect,
          duration: args.duration ? args.duration : 1,
          extras: args.extras ? args.extras : {}
        };
      }
      if (args.inviteToken) {
        state.inviteToken = args.inviteToken;
      }
      return this.service("auth").getStrategyInfo(state);
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = AuthConfig;
