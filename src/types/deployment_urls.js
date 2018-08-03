const BaseType = require("./base.js");

class DeploymentUrls extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "DeploymentUrls";
    this.typeDef = `
    type DeploymentUrls {
      type: String
      url: String
    }`;
  }

  resolver() {
    return {
      type(value) {
        return value.type || null;
      },
      url(value) {
        return value.url || null;
      }
    };
  }
}

module.exports = DeploymentUrls;