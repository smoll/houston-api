import {PostgresUser, Service} from "../../../houston/src/data/connectors";

const BaseService = require("./base.js");

class ServiceAccountService extends BaseService {

  async fetchServiceAccountByKey (apiKey, throwError = true) {
    let service = await this.model("service_accounts")
      .query()
      .eager("roles")
      .where({
        apiKey: apiKey
      });

    if (service) {
      return service;
    }
    if (throwError) {
      this.notFound("service_account", serviceAccount);
    }
    return null;
  }

  async fetchServiceAccountByUuid (uuid, throwError = true) {
    let service = await this.model("service_accounts")
      .query()
      .eager("roles")
      .findById(uuid);

    if (service) {
      return service;
    }
    if (throwError) {
      this.notFound("service_account", serviceAccount);
    }
    return null;
  }

  async fetchServiceAccountsByEntity(entityType, entityUuid) {
    const serviceAccounts = await this.model("service_account")
      .query()
      .eager("roles")
      .where({
        entity_type: entityType,
        entity_uuid: entityUuid,
      });

    if (serviceAccounts && serviceAccounts.length > 0) {
      return serviceAccounts;
    }

    return [];
  }

  async createServiceAccount(label, category, type, uuid) {
    // TODO: Add label and category validation
    return await this.model("group").query().insertGraph([{
      label: label,
      category: category,
      entityType: type,
      entityUuid: uuid || null
    }]).returning("*");
  }

  async updateServiceAccount(serviceAccount, payload) {
    let changes = {};

    if (payload["label"] !== undefined && payload.label !== serviceAccount.label) {
      changes.label = payload.label;
    }
    if (payload["category"] !== undefined && payload.description !== serviceAccount.category) {
      changes.category = payload.category;
    }

    if(serviceAccount.keys(changes).length === 0) {
      return false;
    }

    return await serviceAccount.$query().patch(changes).returning("*");
  }

  async deleteServiceAccount(serviceAccount) {
    return await serviceAccount.$query().delete();
  }

  async deleteServiceAccountByUuid(uuid) {
    return await this.model("service_account").query().deleteById(uuid);
  }
}

module.exports = ServiceAccountService;
