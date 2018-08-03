const BaseType = require("./base.js");

class UserProperty extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "UserProperty";
    this.typeDef = `
    type UserProperty {
      key: String
      value: String
      category: String
    }
    `;
    // timezone: String
    // company: String
    // department: String
  }

  resolver() {
    return {
      key(value) {
        return value.key
      },
      value(value) {
        return value.value
      },
      category(value) {
        return value.category
      }
    };
  }
}

module.exports = UserProperty;