const BaseOperation = require("../base.js");

class Deployments extends BaseOperation {
  constructor() {
    super();
    this.name = "deployments";
    this.typeDef = `
      # Fetches one or more deployments based on input. If a deploymentUuid is return, it will return at most one deployment
      deployments(deploymentUuid: Uuid, teamUuid: Uuid, releaseName: String): [Deployment]
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      if (args.deploymentUuid) {
        return [this.service("deployment").fetchByUuid(args.deploymentUuid)];
      } else if (args.teamUuid) {
        return this.service("deployment").fetchByTeamUuid(args.teamUuid);
      } else if (args.releaseName) {
        return [this.service("deployment").fetchByReleaseName(args.releaseName)];
      } else {
        return this.service("deployment").fetchByUserUuid(context.userUuid());
      }

    } catch (err) {
      this.error(err.message);
      // TODO: Should throw error
      return [];
    }
  }
}

module.exports = Deployments;
