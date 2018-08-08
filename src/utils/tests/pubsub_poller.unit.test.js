const { PubSubPoller } = require("../pubsub_poller.js");

const DummyPubSub = {
  result: null,
  asyncIterator: function() {
    return {
      args: arguments
    };
  },
  publish: function(channel, data) {
    this.result = data;
  }
};

describe("Testing instance of PubSubPoller()", () => {

  describe("calling subscribe", () => {
    let poller;
    let pollFunc;

    beforeEach(() => {
      pollFunc = jest.fn();
      poller = new PubSubPoller(DummyPubSub, "test");
    });

    test("add watcher to list", () => {
      poller.start = () => {};
      expect(poller.watchers.length).toEqual(0);
      poller.subscribe("test");
      expect(poller.watchers.length).toEqual(1);
      expect(poller.watchers[0]).toEqual("test");
    });

    test("calls start() if only 1 watcher", () => {
      poller.start = jest.fn();
      expect(poller.watchers.length).toEqual(0);
      poller.subscribe("test");
      expect(poller.watchers.length).toEqual(1);
      expect(poller.start).toHaveBeenCalled();
    });

    test("does not call start() if more than one watcher", () => {
      poller.start = () => {};
      poller.subscribe("test");

      poller.start = jest.fn();
      poller.subscribe("foo");

      expect(poller.start).not.toHaveBeenCalled();
    });

    test("returns modified default iterator", () => {
      poller.start = () => {};
      let result = poller.subscribe("test");

      expect(result.hasOwnProperty("args")).toBe(true);
      expect(result.hasOwnProperty("return")).toBe(true);
      expect(result.hasOwnProperty("foo")).toBe(false);
    });
  });

  describe("calling unsubscribe", () => {
    let poller;
    let pollFunc;

    beforeEach(() => {
      pollFunc = jest.fn();
      poller = new PubSubPoller(DummyPubSub, "test");
    });

    test("remove watcher from list", () => {
      poller.start = () => {};
      poller.watchers = ["test", "foo", "bar"];
      poller.unsubscribe("test");
      expect(poller.watchers.length).toEqual(2);
    });

    test("calls stop() if no more watchers", () => {
      poller.stop = jest.fn();
      poller.watchers = ["test"];
      poller.unsubscribe("test");
      expect(poller.watchers.length).toEqual(0);
      expect(poller.stop).toHaveBeenCalled();
    });

    test("does not call stop() if remaining watchers", () => {
      poller.stop = jest.fn();
      poller.watchers = ["test", "foo", "bar"];
      poller.unsubscribe("test");
      expect(poller.watchers.length).toEqual(2);
      expect(poller.stop).not.toHaveBeenCalled();
    });
  });

  describe("calling start", () => {
    test("calls poll func", async () => {
      const poller = new PubSubPoller(DummyPubSub, "publish_test", jest.fn());

      poller.interval = 50;
      poller.start();

      await new Promise((resolve) => {
        setTimeout(() => { return resolve() }, 51)
      });

      expect(poller.pollFunc).toHaveBeenCalled();
      clearInterval(poller.poller);
    });
  });
});