const _ = require("lodash");

const BaseService = require("./base.js");
const Constants = require("../constants.js");
class ServiceAccountService extends BaseService {

  async fetchServiceAccountByKey(apiKey, throwError = true) {
    let service = await this.model("service_account")
      .query()
      .eager("roles")
      .findOne("apiKey", apiKey);

    if (service) {
      return service;
    }
    if (throwError) {
      this.notFound("service_account", apiKey);
    }
    return null;
  }

  async fetchServiceAccountByUuid(uuid, throwError = true) {
    let service = await this.model("service_account")
      .query()
      .eager("roles")
      .findById(uuid);

    if (service) {
      return service;
    }
    if (throwError) {
      this.notFound("service_account", uuid);
    }
    return null;
  }

  async fetchServiceAccountsByEntity(entityType, entityUuid = null) {
    const search = {
      entity_type: entityType,
    };
    if (entityUuid) {
      search.entity_uuid = entityUuid;
    }

    const serviceAccounts = await this.model("service_account")
      .query()
      .eager("roles")
      .where(search);

    if (serviceAccounts && serviceAccounts.length > 0) {
      return serviceAccounts;
    }

    return [];
  }

  async createServiceAccount(label, category, type, uuid) {
    // TODO: Add label and category validation
    let roleUuid = null;

    switch(type) {
      case Constants.ENTITY_DEPLOYMENT:
        roleUuid = await this.service("system_setting").getSetting(Constants.SYSTEM_SETTING_DEPLOYMENT_ROLE_TEMPLATE);
        break;
      case Constants.ENTITY_WORKSPACE:
        roleUuid = await this.service("system_setting").getSetting(Constants.SYSTEM_SETTING_WORKSPACE_ROLE_TEMPLATE);
        break;
      case Constants.ENTITY_SYSTEM:
        roleUuid = await this.service("system_setting").getSetting(Constants.SYSTEM_SETTING_SYSTEM_ROLE_TEMPLATE);
        break
    }
    const roles = [];
    if (roleUuid) {
      roles.push({
        role_uuid: roleUuid,
      });
    }

    return await this.model("service_account").query().insertGraph([{
      label: label,
      category: category,
      entityType: type,
      entityUuid: uuid || null,
      service_account_roles: roles,
    }]).returning("*").first();
  }

  async updateServiceAccount(serviceAccount, payload) {
    let changes = {};

    if (payload["label"] !== undefined && payload.label !== serviceAccount.label) {
      changes.label = payload.label;
    }

    if (payload["category"] !== undefined && payload.description !== serviceAccount.category) {
      changes.category = payload.category;
    }

    if (Object.keys(changes).length === 0) {
      return false;
    }

    return await serviceAccount.$query().patch(changes).returning("*").first();
  }

  async updateServiceAccountLastUsed(serviceAccount) {
    return await serviceAccount.$query().patch({
      last_used_at: new Date().toISOString()
    });
  }

  async deleteServiceAccount(serviceAccount) {
    return await serviceAccount.$query().delete();
  }

  async deleteServiceAccountByUuid(uuid) {
    return await this.model("service_account").query().deleteById(uuid);
  }
}

module.exports = ServiceAccountService;
