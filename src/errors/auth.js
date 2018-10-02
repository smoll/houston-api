const BaseError = require("./base.js");

class AuthError extends BaseError {
  constructor(message, data = undefined) {
    super(...arguments);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

module.exports = AuthError;
