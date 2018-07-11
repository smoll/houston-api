const BaseOperation = require("../base.js");

class CreateDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "createDeployment";
    this.typeDef = `
      # Creates a new deployment
      createDeployment(type: String!, label: String!, workspaceUuid: Uuid, version: String) : Deployment
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
        context.resources.workspace,
        args.type,
        args.version,
        args.label,
      );

      // On duplicate error will be;  duplicate key value violates unique constraint \"unique_workspace_uuid_label\"",
      await this.service("commander").createDeployment(deployment, args.config);

      return deployment;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }

}

module.exports = CreateDeployment;
