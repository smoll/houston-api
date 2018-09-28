const { BaseOperation } = require("sealab");

const Errors = require("../errors/index.js");

class HoustonOperation extends BaseOperation {
  notFound(resource, criteria) {
    throw Errors.ResourceNotFound(resource, criteria);
  }

  unauthorized(action) {
    throw Errors.Unauthorized(action);
  }

  invalidInput(errors) {
    throw Errors.InputInvalid(this.name, errors);
  }

  inputError(message) {
    const error = new Errors.InputError(message);
    error.setOperation(this.name);
    throw error;
  }

  notFoundError(message) {
    const error = new Errors.GeneralError(message);
    error.setOperation(this.name);
    throw error;
  }

  userNotFound(criteria) {
    throw Errors.UserNotFound(criteria);
  }

  guardError(error, context) {
    switch(error.guardId) {
      case "authenticated":
        if (context.session.token.expired) {
          throw Errors.AuthExpired();
        }
        throw Errors.Unauthorized(this.name);
      case "permission":
        throw Errors.Unauthorized(this.name);
      default:
        throw Errors.Unauthorized(this.name);
    }
  }

  errors() {
    return Errors;
  }
}
module.exports = HoustonOperation;
