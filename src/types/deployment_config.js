const BaseType = require("./base.js");

const Config = require("../utils/config.js");

class DeploymentConfig extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "DeploymentConfig";
    this.typeDef = `
    type DeploymentConfig {
      defaults: JSON
      limits: JSON
      presets: JSON
    }`;
  }

  resolver() {
    return {
      defaults(value) {
        return value.defaults || {};
      },
      limits(value) {
        return value.limits || {};
      },
      presets(value) {
        return value.presets || {};
      }
    };
  }
}

module.exports = DeploymentConfig;
