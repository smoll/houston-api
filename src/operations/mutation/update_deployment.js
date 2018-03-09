const BaseOperation = require("../base.js");

class UpdateDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "updateDeployment";
    this.typeDef = `
      # Creates a new deployment
      updateDeployment(deploymentUuid: ID, title: String, teamUuid: ID) : StatusMessage
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      const deployment = await this.service("deployment").updateDeployment(context.resources.deployment, {
        title: args.title,
        team: context.resources.team
      });

      return {
        success: true,
        message: "Deployment updated",
        id: deployment.uuid,
        code: null
      }
    } catch (err) {
      this.error(err.message());
      return {
        success: true,
        message: "Deployment failed to update",
        id: null,
        code: null
      }
    }
  }
}

module.exports = UpdateDeployment;
