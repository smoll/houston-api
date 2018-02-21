const { SchemaBuilder } = require("./operations.js");


SchemaBuilder.addTypeDef(`
  scalar JSON
`);

SchemaBuilder.addTypeDef(`
  scalar Date
`);

SchemaBuilder.addType('Token', `type Token {
    success: Boolean
    message: String
    token: String
    decoded: DecodedToken
  }`, {
  success(payload) {
    return payload.success;
  },
  message(payload) {
    return payload.message;
  },
  token(payload) {
    return payload.token;
  },
  decoded(payload) {
    return payload.decoded;
  }
});

SchemaBuilder.addType('DecodedToken', `type DecodedToken {
    id: ID
    sU: Boolean
    iat: Int
    exp: Int
  }`, {
  id(payload) {
    return payload.id || null;
  },
  sU(payload) {
    return payload.sU || false;
  },
  iat(payload) {
    return payload.iat || null;
  },
  exp(payload) {
    return payload.exp || null;
  },
});