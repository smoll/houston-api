const HelmConfig = require("../helm_config.js");

describe("Testing HelmConfig", () => {

  describe("with empty config", () => {
    let config;

    beforeEach(() => {
      config = new HelmConfig({});
    });

    test("get value", () => {
      expect(config.getKey("no.exists")).toEqual(null);
    });

    test("set value", () => {
      config.setKey("foo.bar", "test");
      expect(config.config["foo"]["bar"]).toEqual("test");
    });
  });

  describe("with default config", () => {
    let config;

    beforeEach(() => {
      config = new HelmConfig({foo: { bar: "123"  }});
    });

    test("get value that exists", () => {
      expect(config.getKey("foo.bar")).toEqual("123");
    });


    test("try to get value that doesnt exist", () => {
      expect(config.getKey("no.exists")).toEqual(null);
    });

    test("set value", () => {
      config.setKey("foo.bar", "987");
      expect(config.getKey("foo.bar")).toEqual("987");
    });
  });
});