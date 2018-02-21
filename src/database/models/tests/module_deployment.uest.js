const ModuleDeployment = require("../module_deployment.js");

describe("", () => {

  describe("with a name that is", () => {
    test("overridden ", () => {
      let service = new ValidService({});
      expect(service.name()).toEqual("valid_service");
    });

    test("not overridden", () => {
      expect(() => {
        let service = new NoName({});
        service.name();
      }).toThrow();
    });
  });

  describe("with setting an application", () => {
    let testOp = null;
    let logFunc = null;


  });
});