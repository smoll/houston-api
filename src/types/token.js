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
      token(value) {
        return value.token || null;
      },
      decoded(value) {
        return value.decoded || false;
      },
    };
  }
}

module.exports = Token;