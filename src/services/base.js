const { BaseService } = require("sealab");

const Errors = require("../errors/index.js");

class HoustonService extends BaseService {
  notFound(resource, criteria) {
    throw Errors.ResourceNotFound(resource, criteria);
  }
}
module.exports = HoustonService;