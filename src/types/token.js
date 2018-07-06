const BaseType = require("./base.js");

class Token extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "Token";
    this.typeDef = `
    type Token {
      value: String
      payload: TokenPayload
    }`;
  }

  resolver() {
    return {
      value(value) {
        return value.value || null;
      },
      payload(value) {
        return value.payload || false;
      },
    };
  }
}

module.exports = Token;