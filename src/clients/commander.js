const Config = require("../utils/config.js");

const GRPC = require("grpc");
const PROTO_PATH = require("commander");
const Logger = require("../logger.js");

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

  createDeployment(deployment, config, secrets) {
    const payload = {
      release_name: deployment.releaseName,
      chart: {
        name: deployment.type,
        version: deployment.version,
      },
      namespace: `${Config.helmConfig(Config.GLOBAL_PLATFORM_NAMESPACE)}-${deployment.releaseName}`,
      raw_config: JSON.stringify(config),
      secrets: secrets
    };

    if (!Config.isProd()) {
      console.log("Commander disabled, skipping #createDeployment");
      console.log(payload);
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      Logger.info("Running commanderClient#createDeployment()");
      this.client.createDeployment(payload, function (err, response) {
        if (err) {
          Logger.info(JSON.stringify(err));
          return reject(err);
        }
        Logger.info(JSON.stringify(response));
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
      Logger.info("Running commanderClient#updateDeployment()");
      this.client.updateDeployment(payload, function (err, response) {
        if (err) {
          Logger.info(JSON.stringify(err));
          return reject(err);
        }
        Logger.info(JSON.stringify(response));
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

  deleteDeployment(deployment, namespace, deleteNamespace = true) {
    if (!namespace) {
      namespace = `${Config.helmConfig(Config.GLOBAL_PLATFORM_NAMESPACE)}-${deployment.releaseName}`;
    }
    const payload = {
      release_name: deployment.releaseName,
      namespace: namespace,
      delete_namespace: deleteNamespace,
    };

    if (!Config.isProd()) {
      console.log("Commander disabled, skipping #deleteDeployment");
      console.log(payload);
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      Logger.info("Running commanderClient#deleteDeployment()");
      this.client.deleteDeployment(payload, function (err, response) {
        if (err) {
          Logger.info(JSON.stringify(err));
          return reject(err);
        }
        Logger.info(JSON.stringify(response));
        return resolve(response);
      });
    });
  }

  getSecret(namespace, secretName) {
    const payload = {
      namespace: namespace,
      name: secretName
    };

    return new Promise((resolve, reject) => {
      Logger.info("Running commanderClient#getSecret()");
      this.client.getSecret(payload, function (err, response) {
        if (err) {
          Logger.info(JSON.stringify(err));
          return reject(err);
        }
        Logger.info(JSON.stringify(response));
        return resolve(response);
      });
    });
  }

  setSecret(namespace, releaseName, secretName, data) {
    const payload = {
      release_name: releaseName,
      namespace: namespace,
      secret: {
        name: secretName,
        data: data
      }
    };

    return new Promise((resolve, reject) => {
      Logger.info("Running commanderClient#setSecret()");
      this.client.getSecret(payload, function (err, response) {
        if (err) {
          Logger.info(JSON.stringify(err));
          return reject(err);
        }
        Logger.info(JSON.stringify(response));
        return resolve(response);
      });
    });
  }
}

module.exports = CommanderClient;
