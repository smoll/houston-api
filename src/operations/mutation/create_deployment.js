const BaseOperation = require("../base.js");

class CreateDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "createDeployment";
    this.typeDef = `
      # Creates a new deployment
      createDeployment(title: String!, organizationUuid: ID, teamUuid: ID, version: String) : StatusMessage
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      // // TODO: Remove in place of context.resource.org
      // const org = await this.service("organization").fetchFirst();

      const deployment = await this.service("deployment").createDeployment(
        args.title,
        context.resources.user,
        context.resources.organization,
        context.resources.team,
      );

      return {
        success: true,
        message: "Deployment created",
        id: deployment.uuid,
        code: null
      }
    } catch (err) {
      this.error(err.message);
      return {
        success: false,
        message: "Failed to create deployment",
        id: null,
        code: null
      }
    }
  }
}

module.exports = CreateDeployment;
