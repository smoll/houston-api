const PasswordGen = require("generate-password");

const Base = require("./base");
const Config = require("../../config.js");
const PostgresUtil = require("../../postgres.js");

class Airflow_0_3_0 extends Base {

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

    // overwrite the secret names to add the deployment release name
    helmConfig.set("data.airflowMetadataSecret", `${this.deployment.releaseName}-airflow-metadata`);
    helmConfig.set("data.airflowResultBackendSecret", `${this.deployment.releaseName}-airflow-result-backend`);

    // generate and redis password
    helmConfig.set("redis.password", PasswordGen.generate({ length: 32, numbers: true }));

    // generate and set fernet key (fernet keys have to be base64 encoded)
    helmConfig.set("fernetKey", new Buffer(PasswordGen.generate({ length: 32, numbers: true })).toString('base64'));
  }

  async deploymentMigrate() {
    throw new Error("Cannot migrate, no known versions before 0.3.0");
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

module.exports = Airflow_0_3_0;