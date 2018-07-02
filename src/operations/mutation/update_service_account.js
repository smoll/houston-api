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
  }

  async resolver(root, args, context) {
    try {
      // 1: Find existing Service Account to update
      const serviceAccount = await this.service("service_account").fetchServiceAccountByUuid(args.serviceAccountUuid);

      // 2: Pass alond existing Service Account and new properties to Service Account Service
      const updatedServiceAccount = await this.service("service_account").updateServiceAccount(serviceAccount, args.payload); // expects args (serviceAccount, payload)

      return updatedServiceAccount;
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = UpdateServiceAccount;
