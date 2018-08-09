const { Application } = require("sealab");

const services = require("./services/index.js");
const models = require("./database/models/index.js");
const logger = require("./logger.js");

const application = new Application({}, logger);

application.registerServices(services);
application.registerModels(models);
application.output = function() {
  console.log(arguments);
};
module.exports = application;
