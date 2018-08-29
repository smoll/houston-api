const AirflowBase = require("./airflow_base.js");

class Airflow_1_9 extends AirflowBase {
  async generateEnv(helmConfig, env) {
    env.push({
      name: "AIRFLOW__WEBSERVER__BASE_URL",
      value: this.airflowUrl(this.deployment.releaseName)
    });
  }
}

module.exports = Airflow_1_9;