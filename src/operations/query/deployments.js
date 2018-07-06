const BaseOperation = require("../base.js");

class Deployments extends BaseOperation {
  constructor() {
    super();
    this.name = "deployments";
    this.typeDef = `
      # Fetches one or more deployments based on input. If a deploymentUuid is return, it will return at most one deployment
      deployments(deploymentUuid: Uuid, workspaceUuid: Uuid, releaseName: String): [Deployment]
    `;
    this.entrypoint = "query";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      if (args.deploymentUuid) {
        return [this.service("deployment").fetchDeploymentByUuid(args.deploymentUuid)];
      } else if (args.workspaceUuid) {
        return this.service("deployment").fetchDeploymentByWorkspaceUuid(args.workspaceUuid, false);
      } else if (args.releaseName) {
        return [this.service("deployment").fetchDeploymentByReleaseName(args.releaseName)];
      } else {
        throw new Error("Deployments can only be listed by deploymentUuid, releaseName, or workspaceUuid");
      }

    } catch (err) {
      this.error(err.message);
      // TODO: Should throw error
      return [];
    }
  }
}

module.exports = Deployments;
