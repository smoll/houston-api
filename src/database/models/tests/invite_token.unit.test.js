const Faker = require("faker");

const Postgres = require("../../postgres.js");
const Team = require("../team.js");
const InviteToken = require("../invite_token.js");

describe("When testing invite_tokens", () => {

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
      let token = await InviteToken.query().insertAndFetch({
        email: "test@local",
        team_uuid: team.uuid,
        assignments: {
          groups: ["group_uuid"]
        }
      });
      expect(token.team_uuid).toEqual(team.uuid);
      done();
    });
  });

  describe("querying relationships", () => {
    test("for team", async (done) => {
      let team = await Team.query().insertAndFetch({
        label: Faker.lorem.words(),
        description: Faker.lorem.sentence(),
      });
      let token = await InviteToken.query().insertAndFetch({
        email: "test@local",
        team_uuid: team.uuid,
        assignments: {
          groups: ["group_uuid"]
        }
      });

      let relationTest = await token.$relatedQuery('team');
      expect(relationTest.label).toEqual(team.label);
      done();
    });
  });
});