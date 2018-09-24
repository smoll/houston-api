const BaseOperation = require("../base.js");

class DeploymentLogs extends BaseOperation {
  constructor() {
    super();
    this.name = "deploymentLogs";
    this.typeDef = `
      # Fetch deployment logs
      deploymentLogs(deploymentUuid: Uuid, component: String) : [DeploymentLog]
    `;
    this.entrypoint = "query";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      return await this.service("elasticsearch").fetchDeploymentLogs(context.session.resources.deployment, args.component);
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = DeploymentLogs;
