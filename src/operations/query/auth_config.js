const BaseOperation = require("../base.js");


class AuthConfig extends BaseOperation {
  constructor() {
    super();
    this.name = "authConfig";
    this.typeDef = `
      # Fetch configuration information about available authentication methods
      authConfig(state: String) : AuthConfig
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      return this.service("auth").getStrategyInfo(args.state);
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = AuthConfig;
