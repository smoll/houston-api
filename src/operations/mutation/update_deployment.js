const BaseOperation = require("../base.js");
const _ = require("lodash");
class UpdateDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "updateDeployment";
    this.typeDef = `
      # Updates an existing deployment
      # Payload options:
      # {
      #   label: String
      #   description: String
      #   images: Object 
      updateDeployment(deploymentUuid: Uuid, payload: JSON!, sync: Boolean) : Deployment
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated", "permission:user_deployment_update"];
  }

  async resolver(root, args, context) {
    try {
      let deployment = context.session.resources.deployment;

      deployment = await this.service("deployment").updateDeployment(deployment, args.payload);

      if (args.sync === true) {
        await this.service("commander").updateDeployment(deployment);
      }

      return deployment;
    } catch (err) {
      this.error(err);
      throw err;
    }
  }
}

module.exports = UpdateDeployment;
