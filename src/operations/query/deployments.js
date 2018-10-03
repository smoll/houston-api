const BaseOperation = require("../base.js");

class Deployments extends BaseOperation {
  constructor() {
    super();
    this.name = "deployments";
    this.typeDef = `
      # Fetches one or more deployments based on input. If a deploymentUuid is return, it will return at most one deployment
      # Fetches all deployments by users UUID if no parameters are specified
      deployments(deploymentUuid: Uuid, workspaceUuid: Uuid, releaseName: String): [Deployment]
    `;
    this.entrypoint = "query";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      if (args.deploymentUuid) {
        return [context.session.resources.deployment];
      } else if (args.workspaceUuid) {
        return this.service("deployment").fetchDeploymentByWorkspaceUuid(args.workspaceUuid);
      } else if (args.releaseName) {
        return [this.service("deployment").fetchDeploymentByReleaseName(args.releaseName)];
      } else {
        return this.service("deployment").fetchAllDeploymentsByUserUuid(context.session.authUser.uuid, {
          throwError: false
        });
      }

    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = Deployments;
