const BaseOperation = require("../base.js");

const Constants = require("../../constants.js");

class DeploymentConfig extends BaseOperation {
  constructor() {
    super();
    this.name = "deploymentConfig";
    this.typeDef = `
      # Fetches config needed to create a module deployment
      deploymentConfig(workspaceUuid: Uuid, type: String, version: String, deploymentUuid: Uuid): DeploymentConfig
    `;
    this.entrypoint = "query";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      const workerPresets = await this.service("system_setting").getSetting(Constants.SYSTEM_SETTING_WORKER_SIZES);
      return {
        ...await this.service("commander").determineConstraints(null),
        presets: {
          workerSizes: workerPresets
        }
      };
    } catch (err) {
      this.error(err.error.message);
      return {};
    }
  }
}

module.exports = DeploymentConfig;
