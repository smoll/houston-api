const BaseOperation = require("../base.js");
class CreateServiceAccount extends BaseOperation {
  constructor() {
    super();
    this.name = "createServiceAccount";
    this.typeDef = `
      # Create a Service Account
      createServiceAccount(label: String!, category: String!, type: EntityType!, uuid: Uuid!) : ServiceAccount
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      const serviceAccount = await this.service("service_account").createServiceAccount(args.label, args.category, args.type, args.uuid); // (label, category, type, uuid)
      return serviceAccount;
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = CreateServiceAccount;
