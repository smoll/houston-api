const BaseType = require("./base.js");

class TokenPayload extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "TokenPayload";
    this.typeDef = `
    type TokenPayload {
      uuid: Uuid
      iat: Int
      exp: Int
    }`;
  }

  resolver() {
    return {
      uuid(value) {
        return value.uuid || null;
      },
      iat(value) {
        return value.iat || null;
      },
      exp(value) {
        return value.exp || null;
      },
    };
  }
}

module.exports = TokenPayload;