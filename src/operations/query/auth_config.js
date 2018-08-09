const BaseOperation = require("../base.js");


class AuthConfig extends BaseOperation {
  constructor() {
    super();
    this.name = "authConfig";
    this.typeDef = `
      # Fetch configuration information about available authentication methods
      authConfig(source: String!, redirect: String!, duration: Int, extras: JSON) : AuthConfig
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      const state = {
        source: args.source,
        redirect: args.redirect,
        duration: args.duration ? args.duration : 1,
        extras: args.extras ? args.extras : {}
      };
      return this.service("auth").getStrategyInfo(state);
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = AuthConfig;
