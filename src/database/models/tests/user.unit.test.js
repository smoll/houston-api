const Faker = require("faker");

const Postgres = require("../../postgres.js");
const User = require("../user.js");
const Organization = require("../organization.js");

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
        password: 'password'
      });
      expect(user.username).toEqual(username);
      done();
    });

    test("with username missing fails", async () => {
      await expect(User.query().insertAndFetch({
        password: 'password'
      })).rejects.toThrow();
    });
  });

  describe("querying relationships", () => {
    test("for organization_users", async (done) => {
      let user = await User.query().insertAndFetch({
        username: Faker.internet.userName(),
        password: 'password'
      });
      let org = await Organization.query().insert({
        title: Faker.lorem.words(),
        description: Faker.lorem.sentence()
      }).returning('*');
      console.log(org);
      await user.$relatedQuery('organizations').relate(org);

      let userOrgs = await user.$relatedQuery('organizations');
      expect(userOrgs[0].title).toEqual(org.title);
      done();
    });
  });
});