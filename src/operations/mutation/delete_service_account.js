const BaseOperation = require("../base.js");
class DeleteServiceAccount extends BaseOperation {
  constructor() {
    super();
    this.name = "deleteServiceAccount";
    this.typeDef = `
      # Delete a Service Account by it's uuid, will return uuid if successful
      deleteServiceAccount(serviceAccountUuid: Uuid!) : ServiceAccount
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      const DeletedServiceAccount = await this.service("service_account").deleteServiceAccountByUuid(context.resources.serviceAccount.uuid);
      if (!!DeletedServiceAccount) {
        return {uuid:context.resources.serviceAccount.uuid};
      } else {
        throw new Error("No Service Accounts were deleted.")
      }
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = DeleteServiceAccount;
