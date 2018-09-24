const Faker = require("faker");

const Postgres = require("../../postgres.js");
const Permission = require("../permission.js");
const Role = require("../role.js");
const ServiceAccount = require("../service_account.js");
const RolePermission = require("../role_permission_map.js");
const ServiceAccountRole = require("../service_account_role_map.js");

describe("When testing service_account", () => {

  beforeAll((done) => {
    return Postgres.PostgresMigration().then(() => {
      done();
    });
  });

  describe("running create", () => {
    test("is successful", async (done) => {
      let label = Faker.lorem.words();

      let service = await ServiceAccount.query().insertAndFetch({
        label: label,
        category: "user",
        entityType: "system",
      });
      expect(service.label).toEqual(label);
      done();
    });
  });

  describe("querying relationships", () => {
    test("for roles", async (done) => {
      let permLabel = Faker.lorem.words();
      let roleLabel = Faker.lorem.words();
      let saLabel = Faker.lorem.words();

      let perm = await Permission.query().insertAndFetch({
        id: Faker.lorem.words().replace(" ", "_"),
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
        permission_id: perm.id,
      });

      let service = await ServiceAccount.query().insertAndFetch({
        label: saLabel,
        category: 'user',
        entityType: "system",
      });

      let serviceRole = await ServiceAccountRole.query().insertAndFetch({
        service_account_uuid: service.uuid,
        role_uuid: role.uuid,
      });

      let relationTest = await service.$relatedQuery('roles');
      expect(relationTest[0].label).toEqual(role.label);
      done();
    });
  });
});