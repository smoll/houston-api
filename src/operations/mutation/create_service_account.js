const BaseOperation = require("../base.js");

const Constants = require("../../constants.js");

class CreateServiceAccount extends BaseOperation {
  constructor() {
    super();
    this.name = "createServiceAccount";
    this.typeDef = `
      # Create a Service Account
      createServiceAccount(label: String!, category: String, entityType: EntityType!, entityUuid: Uuid) : ServiceAccount
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, { session }) {
    try {
      if (!this.checkPermissionByEntityType(args.entityType, session)) {
        return this.unauthorized("create_service_account");
      }

      const serviceAccount = await this.service("service_account").createServiceAccount(
        args.label,
        args.category,
        args.entityType,
        args.entityUuid
      );

      serviceAccount.new = true;
      return serviceAccount;
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }

  checkPermissionByEntityType(entityType, session) {
    if (session.hasPermissions("global_service_account_list")) {
      return true;
    }

    if (entityType === Constants.ENTITY_WORKSPACE) {
      return session.hasPermissions("user_workspace_service_account_list");
    }

    if (entityType === Constants.ENTITY_DEPLOYMENT) {
      return session.hasPermissions("user_deployment_service_account_list");
    }

    return false;
  }
}

module.exports = CreateServiceAccount;
