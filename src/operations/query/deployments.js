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
    const session = context.session;
    
    try {
      if (args.deploymentUuid) {
        if (!session.hasPermissions("user_deployment_view")) {
          return this.unauthorized("view_deployment_by_uuid");
        }
        return [this.service("deployment").fetchDeploymentByUuid(args.deploymentUuid)];
      } else if (args.workspaceUuid) {
        if (!session.hasPermissions("user_deployment_list")) {
          return this.unauthorized("view_deployment_by_workspace");
        }
        return this.service("deployment").fetchDeploymentByWorkspaceUuid(args.workspaceUuid, false);
      } else if (args.releaseName) {
        // todo check explicitly for deployment
        // if (!session.hasPermissions("user_deployment_view")) {
        //   return this.unauthorized("view_deployment_by_release_name");
        // }
        return [this.service("deployment").fetchDeploymentByReleaseName(args.releaseName)];
      } else {
        throw new Error("Deployments can only be listed by deploymentUuid, releaseName, or workspaceUuid");
      }

    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = Deployments;
