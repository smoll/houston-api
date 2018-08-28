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
    if (!Config.isProd()) {
      return Promise.resolve(true);
    }

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
    return Promise.reject("Not implemented");

    if (!Config.isProd()) {
      return Promise.resolve(true);
    }

    this.client.fetchDeployment({}, function(err, response) {
      console.log(err);
      console.log(response);
    });
  }

  createDeployment(deployment, config) {
    const payload = {
      release_name: deployment.releaseName,
      chart: {
        name: deployment.type,
        version: deployment.version,
      },
      namespace: `${Config.helmConfig(Config.GLOBAL_PLATFORM_RELEASE)}-${deployment.releaseName}`,
      raw_config: JSON.stringify(config),
      secrets: {}
    };

    if (!Config.isProd()) {
      console.log("Commander disabled, skipping #createDeployment");
      console.log(payload);
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      this.client.createDeployment(payload, function (err, response) {
        if (err) {
          return reject(err);
        }
        return resolve(response);
      });
    });
  }

  updateDeployment(deployment, config) {
    const payload = {
      release_name: deployment.releaseName,
      chart: {
        name: deployment.type,
        version: deployment.version,
      },
      raw_config: JSON.stringify(config),
    };

    if (!Config.isProd()) {
      console.log("Commander disabled, skipping #updateDeployment");
      console.log(payload);
      return Promise.resolve(true);
    }

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
    return Promise.reject("Not implemented");
    if (!Config.isProd()) {
      return Promise.resolve(true);
    }
  }

  deleteDeployment(deployment) {
    if (!Config.isProd()) {
      return Promise.resolve(true);
    }

    const payload = {
      release_name: deployment.releaseName,
    };

    console.log("Commander disabled, skipping #deleteDeployment");
    console.log(payload);

    return new Promise((resolve, reject) => {
      this.client.deleteDeployment(payload, function (err, response) {
        if (err) {
          return reject(err);
        }
        return resolve(response);
      });
    });
  }
}

module.exports = CommanderClient;
