const Faker = require("faker");

const Postgres = require("../../postgres.js");
const Workspace = require("../workspace.js");
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

      let workspace = await Workspace.query().insertAndFetch({
        label: label,
        description: Faker.lorem.sentence(),
      });
      let token = await InviteToken.query().insertAndFetch({
        email: "test@local",
        workspace_uuid: workspace.uuid,
        assignments: {
          groups: ["group_uuid"]
        }
      });
      expect(token.workspace_uuid).toEqual(workspace.uuid);
      done();
    });
  });

  describe("querying relationships", () => {
    test("for workspace", async (done) => {
      let workspace = await Workspace.query().insertAndFetch({
        label: Faker.lorem.words(),
        description: Faker.lorem.sentence(),
      });
      let token = await InviteToken.query().insertAndFetch({
        email: "test@local",
        workspace_uuid: workspace.uuid,
        assignments: {
          groups: ["group_uuid"]
        }
      });

      let relationTest = await token.$relatedQuery('workspace');
      expect(relationTest.label).toEqual(workspace.label);
      done();
    });
  });
});