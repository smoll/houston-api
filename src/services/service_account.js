import {PostgresUser, Service} from "../../../houston/src/data/connectors";

const BaseService = require("./base.js");

class ServiceAccountService extends BaseService {

  async fetchServiceAccountByKey (apiKey) {
    let service = await this.model("service_accounts")
      .query()
      .findOne("api_key". apiKey);

    if (service) {
      return service;
    }
    return null;
  }

  async fetchServiceAccountByUuid (uuid) {
    let service = await this.model("service_accounts")
      .query()
      .findById(uuid);

    if (service) {
      return service;
    }
    return null;
  }

  async fetchServiceAccounts(type, uuid = null) {
    // search by entity type and id
    let type = [];
    let uuid = [];
    if (system === true) {
      type.push(Service.TYPE_SYSTEM);
    }
    if (organization) {
      type.push(Service.TYPE_ORGANIZATION);
      uuid.push(organization);

    }
    if (project) {
      type.push(Service.TYPE_PROJECT);
      uuid.push(project);
    }

    let condition = {};
    if (type.length) {
      condition.serviceType = type;
    }
    if (uuid.length) {
      condition.serviceUuid = uuid;
    }

    return Service.findAll({ where: condition });
  }

  async createServiceAccount(user, title, type, category, uuid) {
    let ServicePrototype = {
      creatorUuid: sys_user.get("uuid"),
      title: title,
      serviceType: type,
      serviceCategory: category,
      serviceUuid: uuid
    };

    if (type === Service.TYPE_SYSTEM) {
      ServicePrototype["serviceUuid"] = null;
    } else if (type === Service.TYPE_ORGANIZATION) {
      //TODO: Save on Organization until all users are ported over to use creatorUuid
    }

    return Service.create(ServicePrototype);
  }

}

module.exports = ServiceAccountService;