// TODO: we need to something to stop setInterval (every graphql query is a new one)... have some sort of object we register each channel with and make them stop when nothing's watching it

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

      const deployment = context.session.resources.deployment;
      const component = args.component;
      const startTime = currentDate - interval;
      const endTime = currentDate;
      return await this.service('elasticsearch').fetchDeploymentLogs(deployment, component, startTime, endTime);
    });
  }
}

module.exports = DeploymentLogStream;
