const { SchemaBuilder } = require("../operations.js");

SchemaBuilder.addType('Token',
  `type Token {
    success: Boolean
    message: String
    token: String
    decoded: DecodedToken
  }`,
  {
    success(value) {
      return value.success;
    },
    message(value) {
      return value.message;
    },
    token(value) {
      return value.token;
    },
    decoded(value) {
      return value.decoded;
    }
  }
);