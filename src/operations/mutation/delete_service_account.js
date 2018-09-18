const BaseOperation = require("../base.js");

const Constants = require("../../constants.js");

class DeleteServiceAccount extends BaseOperation {
  constructor() {
    super();
    this.name = "deleteServiceAccount";
    this.typeDef = `
      # Delete a Service Account by it's uuid, will return uuid if successful
      deleteServiceAccount(serviceAccountUuid: Uuid!) : ServiceAccount
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, { session }) {
    try {
      if (!this.checkPermissionByEntityType(args.entityType, session)) {
        return this.unauthorized("delete_service_account");
      }

      await this.service("service_account").deleteServiceAccount(session.resources.serviceAccount);

      return {
        uuid: session.resources.serviceAccount.uuid
      };
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }

  checkPermissionByEntityType(entityType, session) {
    if (session.hasPermissions("global_service_account_delete")) {
      return true;
    }

    if (entityType === Constants.ENTITY_WORKSPACE) {
      return session.hasPermissions("user_workspace_service_account_delete");
    }

    if (entityType === Constants.ENTITY_DEPLOYMENT) {
      return session.hasPermissions("user_deployment_service_account_delete");
    }

    return false;
  }
}

module.exports = DeleteServiceAccount;
