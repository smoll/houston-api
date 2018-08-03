const BaseOperation = require("../base.js");
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

  async resolver(root, args, context) {
    try {
      const updatedServiceAccount = await this.service("service_account").updateServiceAccount(context.session.resources.serviceAccount, args.payload); // expects args (serviceAccount, payload)
      return updatedServiceAccount;
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = UpdateServiceAccount;
