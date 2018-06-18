const BaseOperation = require("../base.js");

class CreateDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "createDeployment";
    this.typeDef = `
      # Creates a new deployment
      createDeployment(type: String!, label: String!, teamUuid: Uuid, version: String) : Deployment
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

      if (!args.teamUuid) {
        throw new Error("Team uuid is required to create a deployment");
      }

      // TODO: Remove in place of context.resource.team
      let team = await this.service("team").fetchTeamByUuid(args.teamUuid);

      let deployment = await this.service("deployment").createDeployment(
        team,
        args.type,
        args.version,
        args.label,
        context.resources.user,
        context.resources.team,
        context.resources.team,
      );
      return deployment;
      await this.service("commander").createDeployment(deployment, args.config);

      return deployment;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }

}

module.exports = CreateDeployment;
