const AirflowBase = require("./airflow_base.js");

class Airflow_1_10 extends AirflowBase {
  async generateEnv(helmConfig, env) {
    env.push({
      name: "AIRFLOW__WEBSERVER__BASE_URL",
      value: this.airflowUrl(this.deployment.releaseName, true),
    });
  }
}

module.exports = Airflow_1_10;