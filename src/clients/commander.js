const Request = require("../utils/request.js");

class CommanderClient {
  constructor(hostname, port) {
    this.http = new Request(hostname, port);
  }

  deploy(deploymentId, componentId, image) {
    let url = `v1/deployments/${deploymentId}/component/${componentId}`;

    return this.http.patch(url, {
      image: image
    });
  }
}

module.exports = CommanderClient;