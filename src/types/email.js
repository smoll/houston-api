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
      created_at: String
      updated_at: String
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
      created_at(value) {
        return value.createdAt || null;
      },
      updated_at(value) {
        return value.updatedAt || null;
      },
    };
  }
}

module.exports = Email;