const BaseError = require("./base.js");

class InputError extends BaseError {
  constructor(message) {
    super(...arguments);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

module.exports = InputError;