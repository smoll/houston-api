const _ = require("lodash");

const BaseService = require("./base.js");
const DockerClient = require("../clients/docker.js");
const Config = require("../utils/config.js");

class DockerService extends BaseService {
  constructor() {
    super(...arguments);
    this.docker = new DockerClient(`https://registry.${Config.baseDomain()}`);
  }

  async fetchImagesByDeployment(deployment) {
    return await this.docker.imageTags(deployment.releaseName, deployment.type);
  }
}

module.exports = DockerService;