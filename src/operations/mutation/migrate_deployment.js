const BaseOperation = require("../base.js");

class MigrateDeployment extends BaseOperation {
  constructor() {
    super();
    this.name = "migrateDeployment";
    this.typeDef = `
      # Creates a new deployment
      migrateDeployment(releaseName: String!, version: String!) : Deployment
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated", "permission:global_deployment_create"];
  }

  async resolver(root, args, context) {
    try {
      /*
         Load deployment from database by releaseName
         Get the image from the old deployment

         Make GRPC call to get secrets for:
          - fernet key
          - db uri for metadata
          - db uri for results backend

         Delete the old deployment via commander
         Update db record and set the version to the one given
         Rebuild the config via 0.5.0 builder, add image to it

         */
      const deployment = await this.service("deployment").fetchDeploymentByReleaseName(args.releaseName);
      await this.service("commander").migrateDeployment(deployment, args.version);

      return deployment;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }

}

module.exports = MigrateDeployment;
