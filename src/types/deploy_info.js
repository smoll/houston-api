const BaseType = require("./base.js");

class DeployInfo extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "DeployInfo";
    this.typeDef = `
    type DeployInfo {
      latest: String
      next: String
    }`;
  }

  resolver() {
    return {
      latest(value) {
        return value.latest || null;
      },
      next(value) {
        return value.next || "cli-1";
      }
    };
  }
}

module.exports = DeployInfo;