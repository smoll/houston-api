/*
  The purpose of this utility is to generate the initial configuration for an Airflow
  helm chart deployment.  Depending on the helm version, and the airflow version
  the configuration could change.  This utility is design to determine the correct config
  for each component of the deployment, and merge them together in the correct order.
 */

let Semver = require("semver");

const Config = require("./config.js");
const DotObject = require("./dot_object.js");
const Constants = require("../constants.js");

// Helm Configs
const Helm_0_5_0 = require("./deployments/helm/airflow_0.5.0.js");
const Helm_0_3_0 = require("./deployments/helm/airflow_0.3.0.js");

// components
const Airflow_1_9  = require("./deployments/component/airflow-1.9.js");
const Airflow_1_10 = require("./deployments/component/airflow-1.10.js");

class DeploymentConfig {
  constructor(deployment) {
    this.deployment = deployment;
    this.helmTemplate = this.getHelmTemplate(deployment.version);
    this.componentTemplate = this.getComponentTemplate(deployment.type, deployment.config.componentVersion);
  }

  getHelmTemplate(version) {
    if (Semver.lte(version, "0.4.1")) {
      // use old version
      return Helm_0_3_0;
    }
    return Helm_0_5_0;
  }

  getComponentTemplate(component, version) {
    switch(component) {
      case DeploymentConfig.COMPONENT_AIRFLOW:
        if (Semver.lt(version, "1.10.0")) {
          return Airflow_1_9;
        }
        return Airflow_1_10;
      default:
        throw new Error("Unknown component");
    }
  }

  async processCreateDeployment(conn, defaults = {}) {
    const helmConfig = new DotObject(defaults);
    const envVars = [];

    const helm = new this.helmTemplate(this.deployment, conn);
    const component = new this.componentTemplate(this.deployment);

    await helm.deploymentSetup(helmConfig, envVars);
    await component.generateEnv(helmConfig, envVars);

    helmConfig.set("env", envVars);

    await helmConfig.merge(this.deployment.config);

    return helmConfig;
  }

  async processUpdateDeployment(defaults) {
    const helmConfig = new DotObject(defaults);
    const envVars = [];

    const component = new this.componentTemplate(this.deployment);

    await component.generateEnv(helmConfig, envVars);

    helmConfig.set("env", envVars);

    await helmConfig.merge(this.deployment.config);

    return helmConfig;
  }

  async processDeleteDeployment(conn) {
    const helm = new this.helmTemplate(this.deployment, conn);
    return await helm.deploymentTeardown();
  }
}

DeploymentConfig.COMPONENT_AIRFLOW = "airflow";

module.exports = DeploymentConfig;

