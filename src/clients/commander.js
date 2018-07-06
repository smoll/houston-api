const Config = require("../utils/config.js");

const GRPC = require("grpc");
const PROTO_PATH = require("commander");
class CommanderClient {
  constructor(hostname, port) {
    const host = `${hostname}:${port}`;

    const proto = GRPC.load({
      root: PROTO_PATH,
      file: "commander.proto",
    });

    this.client = new proto.commander.Commander(host, GRPC.credentials.createInsecure());
  }

  status() {
    return this.client.getChannel();
  }

  ping() {
    return new Promise((resolve, reject) => {
      this.client.ping({}, function(err, response) {
        if (err) {
          return reject(err);
        }
        return resolve(response);
      });
    });

  }

  fetchDeployment(options = {}) {
    this.client.fetchDeployment({}, function(err, response) {
      console.log(err);
      console.log(response);
    });
  }

  createDeployment(deployment, options = {}) {
    // add static global config to options.config
    options.config["global"] = JSON.parse(Config.get(Config.HELM_GLOBAL_CONFIG));

    const payload = {
      release_name: deployment.releaseName,
      chart: {
        name: deployment.type,
        version: deployment.version,
      },
      team_uuid: deployment.workspaceUuid,
      raw_config: JSON.stringify(options.config),
      secrets: options.secrets
    };

    return new Promise((resolve, reject) => {
      this.client.createDeployment(payload, function (err, response) {
        if (err) {
          return reject(err);
        }
        return resolve(response);
      });
    });
  }

  updateDeployment(deployment) {
    // add static global config
    let config = deployment.getConfigCopy();
    config["global"] = JSON.parse(Config.get(Config.HELM_GLOBAL_CONFIG));

    const payload = {
      release_name: deployment.releaseName,
      chart: {
        name: deployment.type,
        version: deployment.version,
      },
      raw_config: JSON.stringify(config),
    };

    return new Promise((resolve, reject) => {
      this.client.updateDeployment(payload, function (err, response) {
        if (err) {
          return reject(err);
        }
        return resolve(response);
      });
    });
  }

  upgradeDeployment(deployment, version) {

  }

  deleteDeployment(deployment) {

  }
}

module.exports = CommanderClient;
