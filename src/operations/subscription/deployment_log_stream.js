const { BaseSubscriptionOperation } = require("sealab");

const PubSubPoller = require("../../utils/pubsub_poller.js");

class DeploymentLogStream extends BaseSubscriptionOperation {
  constructor() {
    super();
    this.name = "deploymentLogStream";
    this.typeDef = `
      # Streams deployment logs from a start time, at specified interval, optionally scoped to a component
      deploymentLogStream(deploymentUuid: String, component: String, interval: Int) : [DeploymentLog]
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

    const channel = "deployment_logs";
    return PubSubPoller.subscribe(this.pubsub(), channel, (currentDate, interval) => {
      console.log("Fake search...");
      return [{
        timestamp: currentDate.getTime().toString(),
        level: interval.toString(),
        message: 'Output test'
      },{
        timestamp: "now",
        level: "error",
        message: 'Still not implemented'
      }];
    });
  }
}

module.exports = DeploymentLogStream;
