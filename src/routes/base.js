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

  ensureApplication() {
    if (!this.application) {
      throw new Error("Application container must be attached to webhook");
    }
  }
}

module.exports = BaseRoute;