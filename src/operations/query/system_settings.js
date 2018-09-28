const BaseOperation = require("../base.js");

class SystemSettings extends BaseOperation {
  constructor() {
    super();
    this.name = "systemSettings";
    this.typeDef = `
      # Fetch platform system settings
      systemSettings() : [SystemSetting]
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      return []
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = SystemSettings;
