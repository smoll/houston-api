const BaseOperation = require("../base.js");
class DeploymentConfig extends BaseOperation {
  constructor() {
    super();
    this.name = "deploymentConfig";
    this.typeDef = `
      # Fetches config needed to create a module deployment
      deploymentConfig(type: String!, version: String): JSON
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

module.exports = DeploymentConfig;