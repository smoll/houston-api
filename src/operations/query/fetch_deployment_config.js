const BaseOperation = require("../base.js");
class FetchDeploymentConfig extends BaseOperation {
  constructor() {
    super();
    this.name = "fetchDeploymentConfig";
    this.typeDef = `
      # Fetches config needed to create a module deployment
      fetchDeploymentConfig(type: String!, version: String): JSON
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      return await this.service("commander").fetchHelmConfig(args.type, args.version);
    } catch (err) {
      this.error(err.error.message);
      return {};
    }
  }
}

module.exports = FetchDeploymentConfig;
