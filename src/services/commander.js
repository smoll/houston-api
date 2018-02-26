const { BaseService } = require("@moilandtoil/sealab-application");

const CommanderClient = require("../clients/commander.js");
const Config = require("../utils/config.js");
class CommonService extends BaseService {
  constructor(application) {
    super(application);
    this.commander = new CommanderClient(Config.get(Config.COMMANDER_HOST), Config.get(Config.COMMANDER_PORT));
  }

  async deployComponent(deploymentId, componentId, image) {
    return this.commander.deploy(deploymentId, componentId, image);
  }
}

module.exports = CommanderClient;