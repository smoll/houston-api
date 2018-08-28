const _ = require("lodash");

class BaseDeployment {

  constructor(deployment) {
    this.deployment = deployment;
  }

  async generateEnv(helmConfig, env) {
    throw new Error("#generateEnv not implemented");
  }
}

module.exports = BaseDeployment;