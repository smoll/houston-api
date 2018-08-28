const AirflowBase = require("./airflow_base.js");

class Airflow_1_9 extends AirflowBase {
  async generateEnv(helmConfig, env) {
    env["AIRFLOW__WEBSERVER__BASE_URL"] = this.airflowUrl();
  }
}

module.exports = Airflow_1_9;