const BaseType = require("./base.js");

class Email extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "Email";
    this.typeDef = `
    type Email {
      address: String
      verified: Boolean
      primary: Boolean
      createdAt: String
      updatedAt: String
    }`;
  }

  resolver() {
    return {
      address(value) {
        return value.address;
      },
      verified(value) {
        return value.verified;
      },
      primary(value) {
        return value.main;
      },
      createdAt(value) {
        return value.createdAt || null;
      },
      updatedAt(value) {
        return value.updatedAt || null;
      },
    };
  }
}

module.exports = Email;