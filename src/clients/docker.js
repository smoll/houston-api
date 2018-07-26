const _ = require("lodash");

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

      let  imageRequest = null;
      try {
        imageRequest = await this.request.get(url, {
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        });
      } catch (err) {
        if (err && err.error && err.error.errors && _.isArray(err.error.errors)) {
          if (err.error.errors[0].code === "NAME_UNKNOWN") {
            return {};
          }
        }
        throw err;

      }
      if (imageRequest.tags.length === 0) {
        return {};
      }
      const latest = this.determineLatestImage(imageRequest.tags);
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

  determineLatestImage(tags) {
    return this.sortTags(tags)[0];
  };

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

  sortTags(tags) {
    return tags.sort((a, b) => {
      const aN = this.tagNumber(a);
      const bN = this.tagNumber(b);
      return aN > bN ? -1: 1; // aN will never equal bN
    });
  }

  tagNumber(tag) {
    let num = 0; // default to 0 should the tag not be formatted `cli-###`
    const pos = tag.indexOf("-");
    if (pos !== -1) {
      num = parseInt(tag.substr(pos + 1));
    }
    if (isNaN(num)) {
      num = 0;
    }
    return num;
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
