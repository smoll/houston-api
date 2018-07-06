const { Application, DefaultLogger } = require("@moilandtoil/sealab-application");
const Faker = require("faker");

const Postgres = require("../../postgres.js");

const DeploymentModel = require("../deployment.js");


const application = new Application({}, new DefaultLogger(DefaultLogger.DEBUG));

application.registerService(UserService);

describe("test deployment", () => {

  beforeAll(async (done) => {
    await Postgres.PostgresMigration();
    done();
  });
  test("config update", async () => {
    const payload = {
      type: DeploymentModel.MODULE_AIRFLOW,
      label: Faker.random.words(),
      release_name: Faker.random.word(),
      version: "0.0.0",
      workspace_uuid: null,
      config: {
        foo: "bar"
      }
    };

    let deployment = await DeploymentModel
      .query()
      .insertGraph(payload).returning("*");

    await deployment.$query().patch({
      config: {
        foo: "derp"
      }
    }).returning("*");

    let check = await DeploymentModel
      .query()
      .findOne("deployments.uuid", deployment.uuid);

    expect(check.config.foo).toEqual("derp");
  });
});