const BaseRoute = require("./base.js");

class HealthZ extends BaseRoute {
  route() {
    return "healthz";
  }

  method() {
    return "get";
  }

  async action(req, res) {
    let healthPassing = true;
    let postgresStatus;
    try {
      postgresStatus = await this.service("common").healthcheckPostgres();
    } catch (e) {
      postgresStatus = false;
      healthPassing = false
    }

    let status = {
      postgres: postgresStatus.toString(),
    };

    return res.status(healthPassing ? 200: 500).send(JSON.stringify(status));
  }
}

module.exports = HealthZ;