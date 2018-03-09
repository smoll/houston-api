const BaseOperation = require("../base.js");

class FetchDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "fetchDeployments";
    this.typeDef = `
      # Fetches one or more deployments based on input. If a deploymentUuid is return, it will return at most one deployment
      fetchDeployments(deploymentUuid: ID, orgUuid: ID): [Deployment]
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      if (args.deploymentUuid) {
        return [this.service("deployment").fetchByUuid(args.deploymentUuid)];
      } else if (args.orgUuid) {
        return this.service("deployment").fetchByOrgUuid(args.orgUuid);
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
