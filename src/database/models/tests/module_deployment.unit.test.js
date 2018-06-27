const { Application, DefaultLogger } = require("@moilandtoil/sealab-application");
const Faker = require("faker");

const Postgres = require("../../postgres.js");

const ModuleDeploymentModel = require("../module_deployment.js");


const application = new Application({}, new DefaultLogger(DefaultLogger.DEBUG));

application.registerService(UserService);

describe("test module_deployment", () => {

  beforeAll(async (done) => {
    await Postgres.PostgresMigration();
    done();
  });
  test("config update", async () => {
    const payload = {
      type: ModuleDeploymentModel.MODULE_AIRFLOW,
      label: Faker.random.words(),
      release_name: Faker.random.word(),
      version: "0.0.0",
      team_uuid: null,
      team_uuid: null,
      config: {
        foo: "bar"
      }
    };

    let deployment = await ModuleDeploymentModel
      .query()
      .insertGraph(payload).returning("*");

    await deployment.$query().patch({
      config: {
        foo: "derp"
      }
    }).returning("*");

    let check = await ModuleDeploymentModel
      .query()
      .findOne("module_deployments.uuid", deployment.uuid);

    expect(check.config.foo).toEqual("derp");
  });
});