const ShortId = require("shortid");
const currentSubs = {};

class PubSubPoller {
  constructor(pubsub, channel, pollFunction) {
    this.pubsub = pubsub;
    this.channel = channel;
    this.pollFunc = pollFunction;
    this.poller = null;
    this.interval = 1000;
    this.watchers = [];
  }

  subscribe(watcherId) {
    this.watchers.push(watcherId);
    const defaultIterator = this.pubsub.asyncIterator(this.channel);

    if (this.watchers.length === 1) {
      this.start();
    }

    return {
      ...defaultIterator,
      return: () => {
        console.log("Disconnected, returning");
        this.unsubscribe(watcherId);
        return defaultIterator.return ? defaultIterator.return() : Promise.resolve({ value: undefined, done: true })
      }
    };
  }

  unsubscribe(watcherId) {
    let pos = this.watchers.indexOf(watcherId);
    if (pos > -1) {
      this.watchers.splice(pos, 1);
    }
    if (this.watchers.length === 0) {
      this.stop();
    }
  }

  start() {
    this.poller = setInterval(() => {
      console.log(`Polling for results for channel "${this.channel}", running at interval "${this.interval}"`);
      this.pubsub.publish(this.channel, this.pollFunc(new Date(), this.interval));
    }, this.interval);
    console.log(`Initialize results for channel "${this.channel}"`);
    this.pubsub.publish(this.channel, this.pollFunc(new Date(), this.interval));
  }

  stop() {
    clearInterval(this.poller);
  }
}

module.exports = {
  subscribe(pubsub, channel, pollerFunction) {
    const watcherId = ShortId.generate();

    // if (!currentSubs.hasOwnProperty(channel)) {
    //   currentSubs[channel] = new PubSubPoller(pubsub, channel);
    // }
    //
    // currentSubs[channel].subscribe(watchId);

    const poller = new PubSubPoller(pubsub, channel, pollerFunction);
    return poller.subscribe(watcherId);
  },
  PubSubPoller,
};