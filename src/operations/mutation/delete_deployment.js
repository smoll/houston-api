const BaseOperation = require("../base.js");

class DeleteDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "deleteDeployment";
    this.typeDef = `
      # Deletes an existing deployment
      deleteDeployment(deploymentUuid: Uuid) : Deployment
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated", "permission:user_deployment_delete"];
  }

  async resolver(root, args, context) {
    try {
      const deployment = await this.service("deployment").fetchDeploymentByUuid(args.deploymentUuid);

      if (!deployment) {
        this.generalError("Deployment not found");
      }

      await this.service("deployment").queueDeploymentDeletion(deployment);

      return {
        uuid: deployment.uuid
      }
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = DeleteDeployment;
