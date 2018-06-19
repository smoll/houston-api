const Faker = require("faker");

const Postgres = require("../../postgres.js");
const Team = require("../team.js");
const Group = require("../group.js");
const User = require("../user.js");
const UserTeam = require("../user_team_map.js");
describe("When testing teams", () => {

  beforeAll((done) => {
    return Postgres.PostgresMigration().then(() => {
      done();
    });
  });

  describe("running create", () => {
    test("is successful", async (done) => {
      let label = Faker.lorem.words();

      let team = await Team.query().insertAndFetch({
        label: label,
        description: Faker.lorem.sentence(),
      });
      expect(team.label).toEqual(label);
      done();
    });
  });

  describe("querying relationships", () => {
    test("for groups", async (done) => {
      let teamLabel = Faker.lorem.words();
      let groupLabel = Faker.lorem.words();

      let team = await Team.query().insertAndFetch({
        label: teamLabel,
        description: Faker.lorem.sentence(),
      });

      let group = await Group.query().insertAndFetch({
        label: groupLabel,
        description: Faker.lorem.sentence(),
        team_uuid: team.uuid
      });

      let relationTest = await team.$relatedQuery('groups');
      expect(relationTest[0].label).toEqual(group.label);
      done();
    });

    test("for users", async (done) => {
      let teamLabel = Faker.lorem.words();
      let username = Faker.internet.userName();

      const user = await User.query().insertAndFetch({
        username: username,
      });

      let team = await Team.query().insertAndFetch({
        label: teamLabel,
        description: Faker.lorem.sentence(),
      });

      let userTeam = await UserTeam.query().insertAndFetch({
        user_uuid: user.uuid,
        team_uuid: team.uuid
      });

      let relationTest = await team.$relatedQuery('users');
      expect(relationTest[0].username).toEqual(username);
      done();
    });
  });
});