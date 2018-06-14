const Faker = require("faker");

const Postgres = require("../../postgres.js");
const Email = require("../email.js");
const User = require("../user.js");

describe("When testing user", () => {

  beforeAll((done) => {
    return Postgres.PostgresMigration().then(() => {
      done();
    });
  });

  describe("running create", () => {
    test("with all fields will be successful", async (done) => {
      let address = Faker.internet.email();

      let user = await User.query().insertAndFetch({
        username: Faker.internet.userName(),
      });

      let email = await Email.query().insertAndFetch({
        address: address,
        user_uuid: user.uuid
      });
      expect(email.address).toEqual(address);
      done();
    });

    test("with username missing fails", async () => {
      await expect(Email.query().insertAndFetch({
        address: Faker.internet.email()
      })).rejects.toThrow();
    });
  });

  describe("querying relationships", () => {
    test("for user", async (done) => {
      let address = Faker.internet.email();

      let user = await User.query().insertAndFetch({
        username: Faker.internet.userName(),
      });
      let email = await Email.query().insertAndFetch({
        address: address,
        user_uuid: user.uuid
      });

      let emailUser = await email.$relatedQuery('user');
     // expect(emailUser[0].title).toEqual(org.title);
      done();
    });
  });
});