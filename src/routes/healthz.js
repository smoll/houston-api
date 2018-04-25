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

    // postgres status
    let postgresStatus;
    try {
      postgresStatus = await this.service("common").healthcheckPostgres();
    } catch (e) {
      postgresStatus = false;
      healthPassing = false
    }

    // commander status
    let commanderStatus;
    try {
      await this.service("commander").ping();
      commanderStatus = true;
    } catch (err) {
      this.error(err);
      commanderStatus = false;
      healthPassing = false
    }

    let status = {
      postgres: postgresStatus.toString(),
      commander: commanderStatus.toString(),
    };

    return res.status(healthPassing ? 200: 500).send(JSON.stringify(status));
  }
}

module.exports = HealthZ;