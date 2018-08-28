const PasswordGen = require("generate-password");

const Base = require("./base");
const Config = require("../../config.js");
const PostgresUtil = require("../../postgres.js");

class Airflow_0_4_2 extends Base {

  async deploymentSetup(helmConfig) {

    // For each deploy, lets create one database for all that deployments data based on release name
    // For each service needed by that deployment, create a schema
    // For each schema create a user
    // Assign privileges to user in schema
    // For each user, default its schema to the one associated to it
    // Note: The reasons for creating a user per schema are:
    //    1) Convenience: each user gets a default schema to use (Not all apps support selecting the schema in the URI)
    //    2) Safety:      prevent one app from accidentally modifying data for another
    //    3) Security:    should there be a vulnerability in one app, compromised connection URI cannot be used for other db's/schema's

    const deployId = this.deployment.releaseName.replace(/-/g, "_");
    const deployDB    = `${deployId}_airflow`;
    const airflowId   = `${deployId}_airflow`;
    const celeryId    = `${deployId}_celery`;

    // create db
    await PostgresUtil.createDatabase(this.airflowConn, deployDB);

    // connect to new db
    const userDB = await PostgresUtil.userAirflowConnect(deployDB);

    // Create user, schema, assign privs for user in schema, set schema as user default
    let airflowUri = await this.createDeploySchema(userDB, deployDB, "airflow", airflowId);
    let celeryUri = await this.createDeploySchema(userDB, deployDB, "celery", celeryId);

    // Close user db connection
    await userDB.destroy();

    // add globals
    const helmGlobals = Config.helmConfig();

    helmConfig.set("ingress.enabled", true);
    helmConfig.set("ingress.baseDomain", helmGlobals.baseDomain);
    helmConfig.set("ingress.acme", helmGlobals.acme);
    helmConfig.set("ingress.class", helmGlobals.releaseName + "-nginx");
    helmConfig.set("networkPolicies.enabled", true);
    helmConfig.set("rbacEnabled", helmGlobals.rbacEnabled);
    helmConfig.set("registryAuthSecretName", helmGlobals.registryAuthSecret);
    helmConfig.set("platform.release", helmGlobals.releaseName);
    helmConfig.set("platform.workspace", this.deployment.workspaceUuid);

    if (!helmConfig.get("executor") || helmConfig.get("executor").indexOf(payload.executor) === -1) {
      helmConfig.set("executor", Airflow_0_4_2.DEFAULT_EXECUTOR);
    }

    // generate database uris for metadata (airflow) and result backend (celery)
    helmConfig.set("data.metadataConnection", PostgresUtil.toObject(airflowUri));
    helmConfig.set("data.resultBackendConnection", PostgresUtil.toObject(celeryUri));

    helmConfig.set("platform.release", helmGlobals.releaseName);
  }

  async deploymentTeardown(helmConfig) {
    const deployId    = this.deployment.releaseName.replace(/-/g, "_");
    const deployDB    = `${deployId}_airflow`;
    const airflowId   = `${deployId}_airflow`;
    const celeryId    = `${deployId}_celery`;

    await PostgresUtil.forceDisconnectSessions(this.airflowConn, deployDB);
    await PostgresUtil.deleteDatabase(this.airflowConn, deployDB);
    await PostgresUtil.deleteUser(this.airflowConn, airflowId);
    await PostgresUtil.deleteUser(this.airflowConn, celeryId);
  }
}

Airflow_0_4_2.SUPPORTED_EXECUTORS = ["LocalExecutor","SequentialExecutor","CeleryExecutor","KubernetesExecutor"];
Airflow_0_4_2.DEFAULT_EXECUTOR = ["CeleryExecutor"];

module.exports = Airflow_0_4_2;