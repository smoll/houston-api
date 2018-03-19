const BaseService = require("./base.js");

const CommanderClient = require("../clients/commander.js");
const Config = require("../utils/config.js");


class CommanderService extends BaseService {
  constructor() {
    super(...arguments);
    this.commander = new CommanderClient(Config.get(Config.COMMANDER_HOST), Config.get(Config.COMMANDER_PORT));
  }

  async deployComponent(deploymentId, componentId, image) {
    return this.commander.deploy(deploymentId, componentId, image);
  }
}

module.exports = CommanderService;