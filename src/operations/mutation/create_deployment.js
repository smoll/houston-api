const BaseOperation = require("../base.js");

class CreateDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "createDeployment";
    this.typeDef = `
      # Creates a new deployment
      createDeployment(type: String!, title: String!, organizationUuid: ID, teamUuid: ID, version: String) : StatusMessage
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      if (!args.version) {
        try {
          args.version = await this.service("commander").latestHelmChartVersion(args.type);
        } catch (err) {

          throw new Error(`Unable to determine latest version for type "${args.type}"`);
        }
      }
      // // TODO: Remove in place of context.resource.org
      // const org = await this.service("organization").fetchFirst();

      let deployment = await this.service("deployment").createDeployment(
        args.type,
        args.version,
        args.title,
        context.resources.user,
        context.resources.organization,
        context.resources.team,
      );

      const result = await this.service("commander").createDeployment(deployment, args.config);

      return {
        success: result.result.success,
        message: result.result.message,
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
