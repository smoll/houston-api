const { Application, DefaultLogger } = require("@moilandtoil/sealab-application");
const Faker = require("faker");

const Postgres = require("../../postgres.js");

const ModuleDeploymentModel = require("../module_deployment.js");
const UserService = require("../../../services/user.js");


const application = new Application({}, new DefaultLogger(DefaultLogger.DEBUG));

application.registerModels([require("../user.js"), require("../local_credential.js"), ModuleDeploymentModel]);
application.registerService(UserService);

describe("test module_deployment", () => {

  let user = null;
  beforeAll(async (done) => {
    await Postgres.PostgresMigration();
    user = await application.service("user").createUser(Faker.internet.email(), "password");
    done();
  });
  test("config update", async () => {
    const payload = {
      type: ModuleDeploymentModel.MODULE_AIRFLOW,
      title: Faker.random.words(),
      release_name: Faker.random.word(),
      version: "0.0.0",
      creator_uuid: user.uuid,
      organization_uuid: null,
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
      .joinEager("creator")
      .whereNull("module_deployments.deleted_at")
      .findOne("module_deployments.uuid", deployment.uuid);

    expect(check.config.foo).toEqual("derp");
  });
});