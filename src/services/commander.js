const _ = require("lodash");
const PasswordGen = require("generate-password");

const BaseService = require("./base.js");
const CommanderClient = require("../clients/commander.js");
const Config = require("../utils/config.js");
const Constants = require("../constants.js");
const HelmMetadata = require("../utils/helm_metadata");
const PostgresUtil = require("../utils/postgres.js");
const DotObject = require("../utils/dot_object.js");
const DeploymentConfig = require("../utils/deployment_config.js");





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
    // if (!Config.isProd()) {
    //   return Promise.resolve(deployment);
    // }

    const constraints = await this.determineConstraints(deployment);

    // merge default constraints
    const defaults = new DotObject();
    defaults.merge(...constraints.defaults);

    const deploymentConfig = new DeploymentConfig(deployment);

    let helmConfig = await deploymentConfig.processCreateDeployment(this.conn("airflow"), defaults.get());
    helmConfig = helmConfig.get();

    return this.commander.createDeployment(deployment, helmConfig);
  }

  async updateDeployment(deployment) {
    const constraints = await this.determineConstraints(deployment);

    // merge default constraints
    const defaults = new DotObject();
    defaults.merge(...constraints.defaults);

    // determine update config
    const deploymentConfig = new DeploymentConfig(deployment);
    const helmConfig = await deploymentConfig.processUpdateDeployment(defaults.get());

    return this.commander.updateDeployment(deployment, helmConfig);
  }

  async deleteDeployment(deployment) {
    // initialize delete with commander
    await this.commander.deleteDeployment(deployment);

    // clean up db
    const deploymentConfig = new DeploymentConfig(deployment);
    return await deploymentConfig.processDeleteDeployment();
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

  async determineConstraints(deployment) {
    const constraints = await this.model("deployment_constraint")
      .query()
      .where((qb) => {
        qb.orWhere({
          "deployment_constraints.entity_uuid": null,
          "deployment_constraints.entity_type": Constants.ENTITY_SYSTEM
        });
        qb.orWhere({
          "deployment_constraints.entity_uuid": deployment.workspaceUuid,
          "deployment_constraints.entity_type": Constants.ENTITY_WORKSPACE
        });
        qb.orWhere({
          "deployment_constraints.entity_uuid": deployment.uuid,
          "deployment_constraints.entity_type": Constants.ENTITY_DEPLOYMENT
        });
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
    return results
  }
}

module.exports = CommanderService;