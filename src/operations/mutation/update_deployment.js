const BaseOperation = require("../base.js");
const _ = require("lodash");
class UpdateDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "updateDeployment";
    this.typeDef = `
      # Creates a new deployment
      updateDeployment(deploymentUuid: ID, title: String, teamUuid: ID, images: JSON, sync: Boolean) : StatusMessage
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      let deployment = await this.service("deployment").fetchByUuid(args.deploymentUuid);

      if (args.title || !_.isEmpty(args.images) || args.team) {
        deployment = await this.service("deployment").updateDeployment(deployment, {
          title: args.title,
          team: context.resources.team,
          images: args.images,
          sync: args.sync
        });
      }

      if (args.sync === true) {
        await this.service("commander").updateDeployment(deployment);
      }

      return {
        success: true,
        message: "Deployment updated",
        id: deployment.uuid,
        code: null
      }
    } catch (err) {
      this.error(err);
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
