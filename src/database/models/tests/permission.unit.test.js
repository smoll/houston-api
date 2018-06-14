const Faker = require("faker");

const Postgres = require("../../postgres.js");
const Permission = require("../permission.js");
const Role = require("../role.js");
const RolePermission = require("../role_permission_map.js");

describe("When testing permission", () => {

  beforeAll((done) => {
    return Postgres.PostgresMigration().then(() => {
      done();
    });
  });

  describe("running create", () => {
    test("is successful", async (done) => {
      let label = Faker.lorem.words();

      let perm = await Permission.query().insertAndFetch({
        label: label,
        scope: 'global',
        category: 'user'
      });
      expect(perm.label).toEqual(label);
      done();
    });
  });

  describe("querying relationships", () => {
    test("for roles", async (done) => {
      let permLabel = Faker.lorem.words();
      let roleLabel = Faker.lorem.words();

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

      let relationTest = await perm.$relatedQuery('role');
      expect(relationTest[0].label).toEqual(role.label);
      done();
    });
  });
});