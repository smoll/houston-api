const BaseError = require("./base.js");

class GeneralError extends BaseError {
  constructor(message) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

module.exports = GeneralError;