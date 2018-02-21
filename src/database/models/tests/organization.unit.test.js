const Faker = require("faker");

const Postgres = require("../../postgres.js");
const Organization = require("../organization.js");
const User = require("../user.js");

describe("When testing organization", () => {

  beforeAll((done) => {
    return Postgres.PostgresMigration().then(() => {
      done();
    });
  });

  describe("running create", () => {
    let title = Faker.lorem.words();
    let description = Faker.lorem.sentence();
    let org = null;
    test("with all fields will be successful", async (done) => {
      org = await Organization.query().insertAndFetch({
        title: title,
        description: description,
      });
      expect(org.title).toEqual(title);
      expect(org.description).toEqual(description);
      done();
    });

    test("with title missing fails", async () => {
      await expect(Organization.query().insertAndFetch({
        description: Faker.lorem.sentence()
      })).rejects.toThrow();
    });
  });

  describe("querying relationships", () => {
    test("for organization_users", async (done) => {
      let user = await User.query().insertAndFetch({
        username: Faker.internet.userName(),
        password: 'password'
      });
      let org = await Organization.query().insertAndFetch({
        title: Faker.lorem.words(),
        description: Faker.lorem.sentence()
      });
      await org.$relatedQuery('users').relate([user]);

      let orgUsers = await org.$relatedQuery('users');
      expect(orgUsers[0].username).toEqual(user.username);
      done();
    });
  });
});
