const { BaseSubscriptionOperation } = require("sealab");
class DeploymentLogs extends BaseSubscriptionOperation {
  constructor() {
    super();
    this.name = "deploymentLogs";
    this.typeDef = `
      # Fetches info about the authenticated requesting user
      deploymentLogs : [DeploymentLog]
    `;
  }

  async resolver(value, args, context) {
    try {
      console.log(value);
      return value;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }

  subscribe(root, args, context, info) {
    console.log("Not implemented");
    const channel = "deployment_logs"; // Math.random().toString(36).substring(2, 15); // random channel name
    setInterval(() => {
      console.log("Sending");
      // this.pubsub().publish(channel, { deploymentLogs: 'Not implemented' });
      this.pubsub().publish(channel, [{
        timestamp: "now",
        level: "error",
        message: 'Not implemented'
      },{
        timestamp: "now",
        level: "error",
        message: 'Still not implemented'
      }]);
    }, 1000);
    return this.pubsub().asyncIterator(channel)
  }
}

module.exports = DeploymentLogs;
