const { Application, ServiceManager, ConnectionManager } = require("@moilandtoil/sealab-application");

const logger = require("./logger.js");

const serviceManager = new ServiceManager();
const connectionManager = new ConnectionManager();
const application = new Application(serviceManager, connectionManager, logger);

module.exports = application;
