const Config = require("../utils/config.js");

const Request = require("../utils/request.js");
const DockerJWT = require("../utils/docker_jwt.js");

class DockerClient {
  constructor(registryUrl) {
    this.request = new Request(registryUrl, null, true);
    this.dockerJWT = new DockerJWT();
  }

  async imageTags(repository, image) {
    try {

      const url = `v2/${repository}/${image}/tags/list`;

      const authToken = await this.createJWT(repository, image);

      const imageRequest = await this.request.get(url, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (imageRequest.tags.length === 0) {
        return {};
      }
      const latest = imageRequest.tags[0];
      return {
        latest: latest,
        next: this.determineNextImage(latest)
      };
    } catch (err) {
      console.log(`Error pulling registry data for ${repository}`);
      console.log(err.message);
      return {};
    }
  }

  determineNextImage(image) {
    const parts = image.split("-");
    if (parts.length === 1) {
      return null
    }
    const num = parseInt(parts[1]);
    if (!num) {
      return null;
    }
    return `${parts[0]}-${(num + 1)}`;
  }

  async createJWT(repository, image) {
    const payload = [{
      type: "repository",
      name: `${repository}/${image}`,
      actions: ["push", "pull"]
    }];

    const registryUser = "houston";
    return await this.dockerJWT.generate(registryUser, payload);
  }
}

module.exports = DockerClient;
