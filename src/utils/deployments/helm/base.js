const PasswordGen = require("generate-password");

const Config = require("../../config.js");
const PostgresUtil = require("../../postgres.js");

class BaseHelm {

  constructor(deployment, airflowConn) {
    this.deployment = deployment;
    this.airflowConn = airflowConn;
  }

  async deploymentSetup(helmConfig) {
    throw new Error("#deploymentSetup not implemented");
  }

  async deploymentTeardown(helmConfig) {
    throw new Error("#deploymentTeardown not implemented");
  }

  async createDeploySchema(userDB, database, schema, user) {
    try {
      const password = PasswordGen.generate({
        length: 32, numbers: true
      });

      const connUser = PostgresUtil.connectionUser(Config.get(Config.AIRFLOW_POSTGRES_URI));

      // create user
      await PostgresUtil.createUser(this.airflowConn, user, password);

      // add grants to do stuff for user role
      await PostgresUtil.creatorGrantRole(this.airflowConn, connUser, user);

      // create schema
      await PostgresUtil.createSchema(userDB, schema, user);

      // grant user access to schema
      await PostgresUtil.resetAccessGrants(userDB, database, schema, user);

      // set schema to be users default
      await PostgresUtil.setUserDefaultSchema(userDB, user, schema);

      // revoke user role grant as airflow conn user won't need it anymore
      await PostgresUtil.creatorRevokeRole(this.airflowConn, connUser, user);

      return Promise.resolve(PostgresUtil.uriReplace(Config.get(Config.AIRFLOW_POSTGRES_URI), {
        database: database,
        username: user,
        password: password
      }));
    } catch (err) {
      console.log(err);
      return Promise.reject("A problem occurred creating database schema");
    }
  }
}

module.exports = BaseHelm;