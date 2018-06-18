const Faker = require("faker");

const Postgres = require("../../postgres.js");
const Permission = require("../permission.js");
const Role = require("../role.js");
const Group = require("../group.js");
const RolePermission = require("../role_permission_map.js");
const GroupRole = require("../group_role_map.js");
const GroupProperty = require("../group_property.js");

describe("When testing group", () => {

  beforeAll((done) => {
    return Postgres.PostgresMigration().then(() => {
      done();
    });
  });

  describe("running create", () => {
    test("is successful", async (done) => {
      let label = Faker.lorem.words();

      let group = await Group.query().insertAndFetch({
        label: label,
        description: Faker.lorem.sentence(),
      });
      expect(group.label).toEqual(label);
      done();
    });
  });

  describe("querying relationships", () => {
    test("for roles", async (done) => {
      let permLabel = Faker.lorem.words();
      let roleLabel = Faker.lorem.words();
      let groupLabel = Faker.lorem.words();

      let perm = await Permission.query().insertAndFetch({
        label: permLabel,
        scope: 'global',
        category: 'user'
      });

      let role = await Role.query().insertAndFetch({
        label: roleLabel,
        category: 'user'
      });

      let rolePerm = await RolePermission.query().insertAndFetch({
        role_uuid: role.uuid,
        permission_uuid: perm.uuid,
      });

      let group = await Group.query().insertAndFetch({
        label: groupLabel,
        description: Faker.lorem.sentence(),
      });

      let groupRole = await GroupRole.query().insertAndFetch({
        group_uuid: group.uuid,
        role_uuid: role.uuid,
      });

      let relationTest = await group.$relatedQuery('roles');
      expect(relationTest[0].label).toEqual(role.label);
      done();
    });

    test("for users", async (done) => {
      /*
       user = await User.query().insertAndFetch({
        username: username,

       */
    });
  });

});