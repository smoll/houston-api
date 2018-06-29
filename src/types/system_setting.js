const BaseType = require("./base.js");

class SystemSetting extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "SystemSetting";
    this.typeDef = `
    type SystemSetting {
      key: String
      value: String
    }`;
  }

  resolver() {
    return {
      key(value) {
        return value.key;
      },
      value(value) {
        return value.value || null;
      }
    };
  }
}

module.exports = SystemSetting;