const Request = require("../utils/request.js");

class CommanderClient {
  constructor(hostname, port) {
    this.http = new Request(hostname, port, true, {
      "Accept": "application/json",
    });
  }

  deploy(deploymentId, componentId, image) {
    let url = `v1/deployments/${deploymentId}/component/${componentId}`;
    let data = {
      image: image
    };
    return this.http.patch(url, data);
  }
}

module.exports = CommanderClient;