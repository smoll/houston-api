const BaseOperation = require("../base.js");

const Constants = require("../../constants.js");

class ServiceAccounts extends BaseOperation {
  constructor() {
    super();
    this.name = "serviceAccounts";
    this.typeDef = `
      # Fetch Service Accounts by apiKey, serviceAccountUuid, or entityType and entityUuid
      serviceAccounts(serviceAccountUuid: Uuid, entityType: EntityType, entityUuid: Uuid): [ServiceAccount]
    `;
    this.entrypoint = "query";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      const session = context.session;

      if (args.serviceAccountUuid) {
        const serviceAccount = context.session.resources.serviceAccount;
        if (!this.checkPermissionByEntityType(serviceAccount.entityType, session)) {
          return this.unauthorized("list_service_accounts");
        }
        return [serviceAccount];
      }

      if (args.entityType && (args.entityType === Constants.ENTITY_SYSTEM || args.entityUuid)) {

        // if entityType is system, there won't be an entityUuid
        // should one be present, just null it out (could error it out, but meh)
        if (args.entityType === Constants.ENTITY_SYSTEM) {
          args.entityUuid = null;
        }
        if (!this.checkPermissionByEntityType(args.entityType, session)) {
          return this.unauthorized("list_service_accounts");
        }
        return this.service("service_account").fetchServiceAccountsByEntity(args.entityType, args.entityUuid)
      }

      if (args.entityType || args.entityUuid) {
        throw new Error("When referencing one, you must include both entityType and entityUuid as arguments");
      }
      throw new Error("Either a serviceAccountUuid or entityType and entityUuid are required as arguments");
    } catch (err) {
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

module.exports = ServiceAccounts;
