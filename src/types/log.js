const BaseType = require("./base.js");

class Log extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "Log";
    this.typeDef = `
    type Log {
      uuid: String
      createdAt: String
      log: String
    }`;
  }

  resolver() {
    return {
      uuid(value) {
        return value.uuid || null;
      },
      createdAt(value) {
        return value.createdAt || null;
      },
      log(value) {
        return value.log || null;
      },
    };
  }
}

module.exports = Log;
