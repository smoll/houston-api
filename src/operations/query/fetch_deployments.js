const BaseOperation = require("../base.js");


class FetchDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "fetchDeployments";
    this.typeDef = `
      # This operation is deprecated
      # "deployments" call should be used instead
      # Will be deleted after July 1, 2018
      fetchDeployments(deploymentUuid: Uuid, teamUuid: Uuid): [Deployment]
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      if (args.deploymentUuid) {
        return [this.service("deployment").fetchByUuid(args.deploymentUuid)];
      } else if (args.teamUuid) {
        return this.service("deployment").fetchByTeamUuid(args.teamUuid);
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

module.exports = FetchDeployment;
