const BaseOperation = require("../base.js");

class Log extends BaseOperation {
  constructor() {
    super();
    this.name = "logs";
    this.typeDef = `
      # Fetches logs
      logs : [Log]
    `;
    this.entrypoint = "query";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {

      const date = new Date()
      date.setMinutes(date.getMinutes() - 10)
      let logs = this.service('log').getLogs(date);
      return logs;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = Log;
