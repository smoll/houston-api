const { Application } = require("@moilandtoil/sealab-application");

const logger = require("./logger.js");

const application = new Application({}, logger);

module.exports = application;
