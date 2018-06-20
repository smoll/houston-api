const DeploymentOperation = require("./deployments.js");


class FetchDeployment extends DeploymentOperation {
  constructor() {
    super();
    this.name = "fetchDeployments";
    this.typeDef = `
      # This operation is deprecated
      # "deployments" call should be used instead
      # Will be deleted after July 1, 2018
      fetchDeployments(deploymentUuid: Uuid, teamUuid: Uuid): [Deployment]
    `;
    this.entrypoint = "query";
  }
}

module.exports = FetchDeployment;
