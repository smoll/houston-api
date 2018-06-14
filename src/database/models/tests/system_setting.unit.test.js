const Faker = require("faker");

const Postgres = require("../../postgres.js");
const SystemSetting = require("../system_setting.js");

describe("When testing system_setting", () => {

  beforeAll((done) => {
    return Postgres.PostgresMigration().then(() => {
      done();
    });
  });

  describe("running create", () => {
    test("is successful", async (done) => {
      let key = Faker.lorem.word();
      let value = Faker.lorem.word();

      let setting = await SystemSetting.query().insertAndFetch({
        key: key,
        value: value,
        category: 'user'
      });
      expect(setting.key).toEqual(key);
      expect(setting.value).toEqual(value);
      done();
    });
  });
});