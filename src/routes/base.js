const Errors = require("../errors");

class BaseRoute {
  constructor(application = null) {
    this.application = application;
  }

  route() {
    throw new Error("Bad webhook implementation, route not specified");
  }

  method() {
    throw new Error("Bad webhook implementation, route not specified");
  }

  action(req, res) {
    throw new Error("Bad webhook implementation, action not specified");
  }

  logger() {
    if (this.application === null) {
      throw new Error("Application container must be attached to route");
    }
    return this.application.logger();
  }

  debug(message, ...additional) {
    this.logger().debug(message, ...additional);
  }

  info(message, ...additional) {
    this.logger().info(message, ...additional);
  }

  error(message, ...additional) {
    this.logger().error(message, ...additional);
  }

  service(serviceName) {
    this.ensureApplication();
    return this.application.service(serviceName);
  }

  model(modelName) {
    this.ensureApplication();
    return this.application.model(modelName);
  }

  conn(connName) {
    this.ensureApplication();
    return this.application.conn(connName);
  }

  inputError(message) {
    const error = new Errors.InputError(message);
    error.setOperation(this.route());
    throw error;
  }

  notFoundError(message) {
    const error = new Errors.GeneralError(message);
    error.setOperation(this.route());
    throw error;
  }

  ensureApplication() {
    if (!this.application) {
      throw new Error("Application container must be attached to webhook");
    }
  }
}

module.exports = BaseRoute;