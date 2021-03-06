const _ = require("lodash");
const { BaseService } = require("sealab");

const Errors = require("../errors/index.js");

class HoustonService extends BaseService {
  resourceNotFound(resource, criteria) {
    throw Errors.ResourceNotFound(resource, criteria);
  }

  notFound(message) {
    throw Errors.NotFoundError(message);
  }

  filterChanges(object, payload, properties) {
    if (!_.isArray(properties) || properties.length === 0) {
      properties = Object.keys(payload);
    }

    const changes = {};

    for(const property of properties) {
      if (payload[property] !== undefined && payload[property] !== object[property]) {
        changes[property] = payload[property];
      }
    }

    return changes;
  }
}
module.exports = HoustonService;