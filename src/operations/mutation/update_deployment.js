const BaseOperation = require("../base.js");
const _ = require("lodash");
class UpdateDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "updateDeployment";
    this.typeDef = `
      # Creates a new deployment
      updateDeployment(deploymentUuid: Uuid, label: String, workspaceUuid: Uuid, images: JSON, sync: Boolean) : Deployment
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      let deployment = await this.service("deployment").fetchDeploymentByUuid(args.deploymentUuid);

      if (args.label || !_.isEmpty(args.images)) {
        deployment = await this.service("deployment").updateDeployment(deployment, {
          label: args.label,
          images: args.images,
          sync: args.sync
        });
      }

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
