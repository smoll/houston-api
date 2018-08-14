const NodeCache = require("node-cache");
const BaseService = require("./base.js");

class SystemSettingService extends BaseService {

  constructor() {
    super(...arguments);
    this.settings = new NodeCache({
      //stdTTL: 300
    });
    this.loadingPromise = null;
  }

  async fetchAll() {
    this.loadingPromise = this.model("system_setting").query();

    const list = await this.loadingPromise;

    for(let setting of list) {
      // TODO: Check if setting is encrypted, if so decrypt
      this.settings.set(setting.key, setting.value);
    }
    return list;
  }

  async ensureFetched() {
    if (this.loadingPromise === null) {
      return this.fetchAll();
    }
    return this.loadingPromise;
  }

  async getSetting(key) {
    await this.ensureFetched();

    const value = this.settings.get(key);

    if (value === undefined) {
      throw Error("Unknown setting");
    }
    return value;
  }

}

module.exports = SystemSettingService;