const BaseOperation = require("../base.js");

class ServiceAccounts extends BaseOperation {
  constructor() {
    super();
    this.name = "serviceAccounts";
    this.typeDef = `
      # Fetch Service Accounts by apiKey, serviceAccountUuid, or entityType and entityUuid
      serviceAccounts(apiKey: String, serviceAccountUuid: String, entityType: EntityType, entityUuid: Uuid): [ServiceAccount]
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      console.log(args.entityType);
      return [];
      if (args.serviceAccountUuid) {
        return [context.resources.serviceAccount];
      } else if (args.apiKey) {
        return this.service("service_account").fetchServiceAccountByKey(args.apiKey);
      } else if (args.entityType && args.entityUuid) {
        return this.service("service_account").fetchServiceAccountsByEntity(args.entityType, args.entityUuid)
      } else if (args.entityType || args.entityUuid) {
        throw new Error("When referencing one, you must include both entityType and entityUuid as arguments");
      }
      return [];
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = ServiceAccounts;
