const BaseOperation = require("../base.js");

const Constants = require("../../constants.js");

class UpdateServiceAccount extends BaseOperation {
  constructor() {
    super();
    this.name = "updateServiceAccount";
    this.typeDef = `
      # Update the Label or Category of a Service Account
      updateServiceAccount(serviceAccountUuid: Uuid!, payload: JSON!) : ServiceAccount
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, { session }) {
    try {
      const serviceAccount = session.resources.serviceAccount;
      if (!this.checkPermissionByEntityType(serviceAccount.entityType, session)) {
        return this.unauthorized("update_service_account");
      }

      return await this.service("service_account").updateServiceAccount(serviceAccount, args.payload); // expects args (serviceAccount, payload)
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }

  checkPermissionByEntityType(entityType, session) {
    if (session.hasPermissions("global_service_account_update")) {
      return true;
    }

    if (entityType === Constants.ENTITY_WORKSPACE) {
      return session.hasPermissions("user_workspace_service_account_update");
    }

    if (entityType === Constants.ENTITY_DEPLOYMENT) {
      return session.hasPermissions("user_deployment_service_account_update");
    }

    return false;
  }
}

module.exports = UpdateServiceAccount;
