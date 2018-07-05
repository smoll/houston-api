const Faker = require("faker");

const Postgres = require("../../postgres.js");
const Workspace = require("../workspace.js");
const Group = require("../group.js");
const User = require("../user.js");
const UserWorkspace = require("../user_workspace_map.js");
describe("When testing workspaces", () => {

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
      expect(workspace.label).toEqual(label);
      done();
    });
  });

  describe("querying relationships", () => {
    test("for groups", async (done) => {
      let workspaceLabel = Faker.lorem.words();
      let groupLabel = Faker.lorem.words();

      let workspace = await Workspace.query().insertAndFetch({
        label: workspaceLabel,
        description: Faker.lorem.sentence(),
      });

      let group = await Group.query().insertAndFetch({
        label: groupLabel,
        description: Faker.lorem.sentence(),
        entity_uuid: workspace.uuid,
        entity_type: Group.ENTITY_WORKSPACE
      });

      let relationTest = await workspace.$relatedQuery('groups');
      expect(relationTest[0].label).toEqual(group.label);
      done();
    });

    test("for users", async (done) => {
      let workspaceLabel = Faker.lorem.words();
      let username = Faker.internet.userName();

      const user = await User.query().insertAndFetch({
        username: username,
      });

      let workspace = await Workspace.query().insertAndFetch({
        label: workspaceLabel,
        description: Faker.lorem.sentence(),
      });

      let userWorkspace = await UserWorkspace.query().insertAndFetch({
        user_uuid: user.uuid,
        workspace_uuid: workspace.uuid
      });

      let relationTest = await workspace.$relatedQuery('users');
      expect(relationTest[0].username).toEqual(username);
      done();
    });
  });
});