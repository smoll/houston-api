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

      const deployment = await this.service("deployment").createDeployment(
        args.type,
        args.version,
        args.title,
        context.resources.user,
        context.resources.organization,
        context.resources.team,
      );

      let config = args.config;
      if (!config) {
        // TODO: maybe always merge the input args with the helm config (but maybe not)
        config = await this.service("commander").fetchHelmConfig(args.type, args.version);
      }
      let request = await this.service("commander").createModuleRequest(deployment, config);

      const result = await this.service("commander").createDeployment(deployment, request);

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
