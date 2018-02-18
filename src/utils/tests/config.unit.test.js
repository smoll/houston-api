const Config = require("../config.js");

describe("When passing defaults on instantiation", () => {

  test("config.defaults should contain the defaults passed", () => {
    let defaults = {
      "FOO": "bar"
    };
    Config.setDefaults(defaults);

    expect(Config.defaults).toHaveProperty("FOO");
    expect(Config.defaults.FOO).toEqual("bar");
  });
});

describe("When calling #get() for", () => {

  process.env["TEST"] = "config";

  test("key that has an env", () => {
    expect(Config.get("TEST")).toEqual("config");
  });

  test("key that has no env, but has default", () => {
    expect(Config.get("FOO")).toEqual("bar");
  });

  test("key that has no env, and no default", () => {
    expect(Config.get("derp")).toEqual(null);
  });
});
