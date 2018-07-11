const _ = require("lodash");
const PasswordGen = require("generate-password");

const BaseService = require("./base.js");
const CommanderClient = require("../clients/commander.js");
const Config = require("../utils/config.js");
const HelmMetadata = require("../utils/helm_metadata");
const PostgresUtil = require("../utils/postgres.js");

class CommanderService extends BaseService {
  constructor() {
    super(...arguments);
    this.commander = new CommanderClient(Config.get(Config.COMMANDER_HOST), Config.get(Config.COMMANDER_PORT));
    this.helmMetadata = new HelmMetadata(
      Config.get(Config.HELM_ASTRO_REPO),
      Config.get(Config.HELM_REPO_EDGE) === "true"
    );
  }

  // grpc wrappers
  async ping() {
    let start = new Date().getTime();
    let response = await this.commander.ping();
    return response.received - start;
  }

  async createDeployment(deployment, config) {
    if (!config) {
      // TODO: maybe always merge the input args with the helm config (but maybe not)
      config = await this.fetchHelmConfig(deployment.type, deployment.version);
    }

    if (!Config.isProd()) {
      return Promise.resolve(deployment);
    }

    let request = await this.createModuleRequest(deployment, config);
    return this.commander.createDeployment(deployment, request).then((response) => {
      return this.service("deployment").updateDeployment(deployment, { config: request.config }).then(() => {
        return response;
      });
    });
  }

  async updateDeployment(deployment) {
    return this.commander.updateDeployment(deployment);
  }

  // helper functions
  async createModuleRequest(deployment, config) {
    switch (deployment.type) {
      case "airflow":
        return this.airflowConfig(deployment, config);
      default:
        this.debug("Unknown module to config");
        return Promise.reject("Unknown module to config");
    }
  }

  async airflowConfig(deployment, config) {
    // For each deploy, lets create one database for all that deployments data based on release name
    // For each service needed by that deployment, create a schema
    // For each schema create a user
    // Assign privileges to user in schema
    // For each user, default its schema to the one associated to it
    // Note: The reasons for creating a user per schema are:
    //    1) Convenience: each user gets a default schema to use (Not all apps support selecting the schema in the URI)
    //    2) Safety:      prevent one app from accidentally modifying data for another
    //    3) Security:    should there be a vulnerability in one app, compromised connection URI cannot be used for other db's/schema's

    const deployId = deployment.releaseName.replace(/-/g, "_");
    const deployDB    = `${deployId}_airflow`;
    const airflowId   = `${deployId}_airflow`;
    const celeryId    = `${deployId}_celery`;

    // create db
    await PostgresUtil.createDatabase(this.conn("airflow"), deployDB);

    // connect to new db
    const userDB = await PostgresUtil.userAirflowConnect(deployDB);

    // Create user, schema, assign privs for user in schema, set schema as user default
    let airflowUri = await this.createDeploySchema(userDB, deployDB, "airflow", airflowId);
    let celeryUri = await this.createDeploySchema(userDB, deployDB, "celery", celeryId);

    // Close user db connection
    await userDB.destroy();

    // overwrite the secret names to add the deployment release name
    config["data"]["airflowMetadataSecret"] = `${deployment.releaseName}-airflow-metadata`;
    config["data"]["airflowResultBackendSecret"] = `${deployment.releaseName}-airflow-result-backend`;
    config["data"]["airflowBrokerSecret"] = `${deployment.releaseName}-airflow-broker`;

    const secrets = [
      {
        name: config["data"]["airflowMetadataSecret"],
        key: "connection",
        value: airflowUri
      },
      {
        name: config["data"]["airflowResultBackendSecret"],
        key: "connection",
        value: PostgresUtil.uriReplace(celeryUri, {
          protocol: "db+postgresql"
        })
      },
      {
        name: config["data"]["airflowBrokerSecret"],
        key: "connection",
        value: Config.get(Config.AIRFLOW_REDIS_URI)
      }
    ];

    const deployConfigs = {
      "env": []
    };

    return {
      "secrets": secrets,
      "config": _.merge(config, deployConfigs)
    }
  }

  async createDeploySchema(userDB, database, schema, user) {
    try {
      const password = PasswordGen.generate({
        length: 32, numbers: true
      });

      // create user
      await PostgresUtil.createUser(this.conn("airflow"), user, password);

      // create schema
      await PostgresUtil.createSchema(userDB, schema, user);

      // grant user access to schema
      await PostgresUtil.resetAccessGrants(userDB, database, schema, user);

      // set schema to be users default
      await PostgresUtil.setUserDefaultSchema(userDB, user, schema);

      return Promise.resolve(PostgresUtil.uriReplace(Config.get(Config.AIRFLOW_POSTGRES_URI), {
        database: database,
        username: user,
        password: password
      }));
    } catch (err) {
      this.error(err.message);
      return Promise.reject("A problem occurred creating database schema");
    }
  }

  async latestHelmChartVersion(chart) {
    return await this.helmMetadata.latestChart(chart);
  }

  async fetchHelmConfig(chart, version = null) {
    if (!version) {
      version = await this.latestHelmChartVersion(chart)
    }
    return await this.helmMetadata.getChart(chart, version);
  }
}

module.exports = CommanderService;