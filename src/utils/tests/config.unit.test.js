"use strict";

const Config = require("../config.js");

describe("When passing defaults on instantiation", () => {

  test("config.defaults should contain the defaults passed", () => {
    let defaults = {
      "foo": "bar"
    };
    let config = new Config(defaults);
    expect(config.defaults).toHaveProperty("foo");
    expect(config.defaults.foo).toEqual("bar");
  });
});

describe("When calling #get() for", () => {

  let config = null;
  process.env["TEST"] = "config";
  beforeEach(() => {
    config = new Config({
      "FOO": "bar"
    });
  });

  test("key that has an env", () => {
    expect(config.get("TEST")).toEqual("config");
  });

  test("key that has no env, but has default", () => {
    expect(config.get("FOO")).toEqual("bar");
  });

  test("key that has no env, and no default", () => {
    expect(config.get("derp")).toEqual(null);
  });
});