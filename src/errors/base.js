const _ = require("lodash");

class BaseError extends Error {
  constructor(message, extra = undefined) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
    this.isHoustonError = true;
    this.operation = null;
  }

  setOperation(operation) {
    this.operation = operation;
  }

  isType(type) {
    return type.name === this.name;
  }
}

module.exports = BaseError;