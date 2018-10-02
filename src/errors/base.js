const _ = require("lodash");

class BaseError extends Error {
  constructor(message, data = undefined) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.isHoustonError = true;
    this.data = data;
  }

  setOperation(operation) {
    this.operation = operation;
  }

  isType(type) {
    return type.name === this.name;
  }
}

module.exports = BaseError;