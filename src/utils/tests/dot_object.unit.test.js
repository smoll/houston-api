const DotObject = require("../dot_object.js");

describe("Testing DotObject", () => {

  describe("with empty object", () => {
    let config;

    beforeEach(() => {
      config = new DotObject({});
    });

    test("get value", () => {
      expect(config.get("no.exists")).toEqual(null);
    });

    test("set value", () => {
      config.set("foo.bar", "test");
      expect(config.object["foo"]["bar"]).toEqual("test");
    });

    test("append array element (non existant array", () => {
      config.append("foo.bar", "test");
      expect(config.object["foo"]["bar"][0]).toEqual("test");
    });

    test("append array element (existing array)", () => {
      config.set("foo.bar", ["derp"]);
      expect(config.object["foo"]["bar"][0]).toEqual("derp");
      config.append("foo.bar", "test");
      expect(config.object["foo"]["bar"][1]).toEqual("test");
    });

    test("remove element from empty array", () => {
      config.set("foo.bar", []);
      config.remove("foo.bar", "test");
      expect(config.object["foo"]["bar"].length).toEqual(0);
    });

    test("remove element from array containing the element", () => {
      config.set("foo.bar", ["test"]);
      expect(config.object["foo"]["bar"][0]).toEqual("test");
      config.remove("foo.bar", "test");
      expect(config.object["foo"]["bar"].length).toEqual(0);
    });
  });

  describe("with default object", () => {
    let config;

    beforeEach(() => {
      config = new DotObject({foo: { bar: "123"  }});
    });

    test("get value that exists", () => {
      expect(config.get("foo.bar")).toEqual("123");
    });


    test("try to get value that doesnt exist", () => {
      expect(config.get("no.exists")).toEqual(null);
    });

    test("set value", () => {
      config.set("foo.bar", "987");
      expect(config.get("foo.bar")).toEqual("987");
    });
  });
});