const BaseType = require("./base.js");

// TODO: customize typeDef fields + add func for each prop in resolver

class DeploymentLog extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "DeploymentLog";
    this.typeDef = `
    type DeploymentLog {
      timestamp: String,
      level: String,
      message: String
    }`;
  }

  resolver() {
    return {
      timestamp(value) {
        return value.timestamp || null;
      },
      level(value) {
        return value.level || null;
      },
      message(value) {
        return value.message || null;
      }
    };
  }
}

module.exports = DeploymentLog;