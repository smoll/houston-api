const BaseType = require("./base.js");

class DecodedToken extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "DecodedToken";
    this.typeDef = `
    type DecodedToken {
      id: ID
      sU: Boolean
      iat: Int
      exp: Int
    }`;
  }

  resolver() {
    return {
      id(value) {
        return value.id || null;
      },
      sU(value) {
        return value.sU || false;
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

module.exports = DecodedToken;