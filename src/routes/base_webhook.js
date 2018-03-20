const BaseRoute = require("./base.js");

class BaseWebhook extends BaseRoute {
  method() {
    return "get";
  }

  ack(res) {
    return res.status(200).send();
  }

  reject(res, reason = "") {
    return res.status(500).send(reason);
  }
}

module.exports = BaseWebhook;