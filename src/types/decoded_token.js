const { SchemaBuilder } = require("../operations.js");

SchemaBuilder.addType('DecodedToken',
  `type DecodedToken {
    id: ID
    sU: Boolean
    iat: Int
    exp: Int
  }`,
  {
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
  }
);