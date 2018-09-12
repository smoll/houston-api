const _ = require("lodash");
const PasswordGen = require("generate-password");

const BaseService = require("./base.js");
const CommanderClient = require("../clients/commander.js");
const Config = require("../utils/config.js");
const Common = require("../utils/common.js");
const Constants = require("../constants.js");
const HelmMetadata = require("../utils/helm_metadata");
const PostgresUtil = require("../utils/postgres.js");
const DotObject = require("../utils/dot_object.js");
const DeploymentConfig = require("../utils/deployment_config.js");
const Transaction = require('objection').transaction;

class CommanderService extends BaseService {
  constructor() {
    super(...arguments);
    this.commander = new CommanderClient(Config.get(Config.COMMANDER_HOST), Config.get(Config.COMMANDER_PORT));

    const allowEdge = Config.get(Config.HELM_REPO_EDGE) === "true";

    this.helmMetadata = new HelmMetadata(
      Config.get(Config.HELM_ASTRO_REPO),
      allowEdge,
    );

    this.info(`Helm "Edge" builds are ${allowEdge ? "enabled" : "disabled"}`);
  }

  // grpc wrappers
  async ping() {
    let start = new Date().getTime();
    let response = await this.commander.ping();
    return response.received - start;
  }

  async createDeployment(deployment) {
    const constraints = await this.determineConstraints(deployment);

    const deploymentConfig = new DeploymentConfig(deployment);

    const data = {
      registryPassword: await Common.randomToken(32),
    };

    await this.service("deployment").updateDeployment(deployment, {
      registryPassword: data.registryPassword,
    });

    let result = await deploymentConfig.processCreateDeployment(this.conn("airflow"), constraints.defaults, data);

    const helmConfig = result.config;
    const helmSecrets = result.secrets;

    return this.commander.createDeployment(deployment, helmConfig.get(), helmSecrets);
  }

  async updateDeployment(deployment) {
    const constraints = await this.determineConstraints(deployment);

    // determine update config
    const deploymentConfig = new DeploymentConfig(deployment);

    const helmConfig = await deploymentConfig.processUpdateDeployment(constraints.defaults);

    return this.commander.updateDeployment(deployment, helmConfig.get());
  }

  async deleteDeployment(deployment) {
    // initialize delete with commander
    await this.commander.deleteDeployment(deployment);

    // clean up db
    const deploymentConfig = new DeploymentConfig(deployment);
    return await deploymentConfig.processDeleteDeployment(this.conn("airflow"));
  }

  async getSecret(namespace, secretName) {
    return await this.commander.getSecret(namespace, secretName);
  }

  // Other functions
  async migrateDeployment(deployment, version) {
    const namespace = Config.helmConfig(Config.GLOBAL_PLATFORM_NAMESPACE);
    const fernetKey = `${deployment.releaseName}-fernet-key`;
    const metadataKey = `${deployment.releaseName}-airflow-metadata`;
    const resultBackendKey = `${deployment.releaseName}-airflow-result-backend`;
    const fernetSecret = await this.service("commander").getSecret(namespace, fernetKey);
    const metadataSecret = await this.service("commander").getSecret(namespace, metadataKey);
    const resultBackendSecret = await this.service("commander").getSecret(namespace, resultBackendKey);

    if (!fernetSecret.result.success) {
      throw new Error("Failed to retrieve fernetKey");
    }
    if (!metadataSecret.result.success) {
      throw new Error("Failed to retrieve metadata connection URI");
    }
    if (!resultBackendSecret.result.success) {
      throw new Error("Failed to retrieve result backend connection URI");
    }

    return await Transaction(this.conn("postgres"), async (trx) => {
      const data = {
        registryPassword: await Common.randomToken(32),
        metadataUri: metadataSecret.secret.data["connection"],
        resultBackendUri: resultBackendSecret.secret.data["connection"],
        fernetKey: fernetSecret.secret.data["fernet-key"]
      };

      const config = {};
      if (deployment.config && deployment.config.images && deployment.config.images.airflow) {
        config.images.airflow = deployment.config.images.airflow;
      }

      deployment = await this.service("deployment").updateDeployment(deployment, {
        registryPassword: data.registryPassword,
        version: version,
        config: config
      }, {
        transaction: trx
      });

      const constraints = await this.determineConstraints(deployment);

      const deploymentConfig = new DeploymentConfig(deployment);

      let helmConfig = await deploymentConfig.processMigrateDeployment(this.conn("airflow"), constraints.defaults, data);

      await this.commander.deleteDeployment(deployment, Config.helmConfig(Config.GLOBAL_PLATFORM_NAMESPACE), false);
      await this.commander.createDeployment(deployment, helmConfig.get());

      return deployment;
    });
  }


  async latestHelmChartVersion(chart) {
    return await this.helmMetadata.latestChart(chart, Config.helmConfig(Config.GLOBAL_PLATFORM_VERSION));
  }

  async fetchHelmConfig(chart, version = null) {
    // Temporarily disabled, functionality needs to be moved to Commander
    // with the added
    return {};

    if (!version) {
      version = await this.latestHelmChartVersion(chart)
    }
    return await this.helmMetadata.getChart(chart, version);
  }

  async determineConstraints(deployment = null) {
    const constraints = await this.model("deployment_constraint")
      .query()
      .where((qb) => {
        qb.orWhere({
          "deployment_constraints.entity_uuid": null,
          "deployment_constraints.entity_type": Constants.ENTITY_SYSTEM
        });
        if (deployment) {
          qb.orWhere({
            "deployment_constraints.entity_uuid": deployment.workspaceUuid,
            "deployment_constraints.entity_type": Constants.ENTITY_WORKSPACE
          });
          qb.orWhere({
            "deployment_constraints.entity_uuid": deployment.uuid,
            "deployment_constraints.entity_type": Constants.ENTITY_DEPLOYMENT
          });
        }
      });

    const assoc = _.keyBy(constraints, 'entityType');

    const results = {
      limits: [],
      defaults: [],
    };

    for(let type of [Constants.ENTITY_SYSTEM, Constants.ENTITY_WORKSPACE, Constants.ENTITY_DEPLOYMENT]) {
      if (!assoc[type]) {
        continue;
      }
      const constraint = assoc[type];
      if (_.isObject(constraint.defaults)) {
        results.defaults.push(constraint.defaults);
      }
      if (_.isObject(constraint.limits)) {
        results.limits.push(constraint.limits);
      }
    }

    let config = { limits: {}, defaults: {}};
    _.merge(config.limits, ...results.limits);
    _.merge(config.defaults, ...results.defaults);
    return config;
  }
}

module.exports = CommanderService;