const { BaseOperation } = require("sealab");

const Errors = require("../errors/index.js");

class HoustonOperation extends BaseOperation {

  notFound(resource, criteria) {
    throw Errors.ResourceNotFound(resource, criteria);
  }

  unauthorized(action, guardError = false) {
    let error = "Requester not authorized to complete this action";
    let data = {};
    if (action) {
      error = `Requester not authorized to execute "${action}"`;
    }
    if (guardError) {
      data.guard = guardError;
    }
    throw new Errors.AuthError(error, data);
  }

  notAuthorized(message) {
    throw new Errors.AuthError(`Permission Denied: ${message}`);
  }

  notFoundError(message) {
    throw new Errors.NotFoundError(message);
  }

  invalidInput(message) {
    throw new Errors.InputError(message);
  }

  generalError(message) {
    throw new Errors.GeneralError(message);
  }

  guardError(error, context) {
    switch(error.guardId) {
      case "authenticated":
        if (context.session.token.expired) {
          throw new Errors.AuthError("Authentication token has expired");
        }
        throw this.unauthorized(this.name, error.guardId);
      case "permission":
        throw this.unauthorized(this.name, error.guardId);
      default:
        throw this.unauthorized(this.name, error.guardId);
    }
  }

  inputError(error, args) {
    if (error.isJoi) {
      throw new Errors.InputError("GraphQL input invalid", error.details);
    }
    throw new Errors.InputError("GraphQL input invalid");
  }

  errors() {
    return Errors;
  }
}
module.exports = HoustonOperation;
