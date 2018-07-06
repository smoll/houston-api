const { BaseOperation } = require("@moilandtoil/sealab-operation");

const Errors = require("../errors/index.js");

class HoustonOperation extends BaseOperation {
  notFound(resource, criteria) {
    throw Errors.ResourceNotFound(resource, criteria);
  }

  unauthorized(action) {
    throw Errors.Unauthorized(action);
  }

  guardError(error, context) {
    if (error.guardId === "authenticated") {
      if (context.token.expired) {
        throw Errors.AuthExpired();
      }
      throw Errors.Unauthorized(this.name);
    }
  }

  errors() {
    return Errors;
  }

  model(modelName) {
    return this.application.model(modelName);
  }
}
module.exports = HoustonOperation;
