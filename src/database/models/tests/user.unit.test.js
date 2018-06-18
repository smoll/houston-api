const Faker = require("faker");

const Postgres = require("../../postgres.js");
const User = require("../user.js");

describe("When testing user", () => {

  beforeAll((done) => {
    return Postgres.PostgresMigration().then(() => {
      done();
    });
  });

  describe("running create", () => {
    let username = Faker.internet.userName();
    let user = null;
    test("with all fields will be successful", async (done) => {
      user = await User.query().insertAndFetch({
        username: username,
      });
      expect(user.username).toEqual(username);
      done();
    });

    test("with username missing fails", async () => {
      await expect(User.query().insertAndFetch({})).rejects.toThrow();
    });
  });
});