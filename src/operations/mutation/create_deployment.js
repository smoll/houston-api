const BaseOperation = require("../base.js");

class CreateDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "createDeployment";
    this.typeDef = `
      # Creates a new deployment
      createDeployment(type: String!, label: String!, description: String, version: String, workspaceUuid: Uuid!, config: JSON!) : Deployment
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

      if (!args.workspaceUuid) {
        throw new Error("Workspace uuid is required to create a deployment");
      }

      let deployment = await this.service("deployment").createDeployment(
        context.session.resources.workspace,
        {
          type: args.type,
          version: args.version,
          label: args.label + Math.random().toString(),
          description: args.description,
          config: args.config,
        }
      );

      this.info(`Attempting to install "${args.type} v${args.version}"`);

      await this.service("commander").createDeployment(deployment);

      return deployment;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }

}

module.exports = CreateDeployment;
