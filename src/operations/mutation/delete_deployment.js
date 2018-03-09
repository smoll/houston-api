const BaseOperation = require("../base.js");

class DeleteDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "deleteDeployment";
    this.typeDef = `
      # Deletes an existing deployment
      deleteDeployment(deploymentUuid: ID) : StatusMessage
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      const deployment = await this.service("deployment").fetchByUuid(args.deploymentUuid);

      if (!deployment) {
        return {
          success: true,
          message: "Deployment not found",
          id: args.deploymentUuid,
          code: null
        }
      }

      await this.service("deployment").deleteDeployment(deployment);

      return {
        success: true,
        message: "Deployment deleted",
        id: args.deploymentUuid,
        code: null
      }
    } catch (err) {
      this.error(err.message);
      return {
        success: true,
        message: "Failed to delete deployment",
        id: args.deploymentUuid,
        code: null
      }
    }
  }
}

module.exports = DeleteDeployment;
