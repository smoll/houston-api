const Common = require("../common.js");

describe("Test #randomToken()", () => {

  test("even length match", (done) => {
    let random = Common.randomToken(10);
    random.then((value) => {
      expect(value.length).toEqual(10);
      done();
    });
  });

  test("odd length match", (done) => {
    let random = Common.randomToken(11);
    random.then((value) => {
      expect(value.length).toEqual(11);
      done();
    });  });
});