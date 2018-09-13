const BaseOperation = require("../base.js");

class CreateDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "createDeployment";
    this.typeDef = `
      # Creates a new deployment
      createDeployment(type: String!, label: String!, workspaceUuid: Uuid!, description: String, version: String, config: JSON) : Deployment
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated", "permission:user_deployment_create"];
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

      if (!args.config) {
        args.config = {};
      }

      if (!args.workspaceUuid) {
        throw new Error("Workspace uuid is required to create a deployment");
      }

      if (!args.config.componentVersion) {
        // TODO: At some point configure this based on the args.type & args.version
        args.config.componentVersion = "1.9.0";
      }

      let deployment = await this.service("deployment").createDeployment(
        context.session.resources.workspace,
        {
          type: args.type,
          version: args.version,
          label: args.label,
          description: args.description,
          config: args.config,
        }
      );

      this.info(`Attempting to install "${args.type}" - v${args.version}"`);

      await this.service("commander").createDeployment(deployment);

      return deployment;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }

}

module.exports = CreateDeployment;
