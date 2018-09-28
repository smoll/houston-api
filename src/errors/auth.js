const BaseError = require("./base.js");

class AuthError extends BaseError {
  constructor(message, extra = undefined) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

module.exports = AuthError;
