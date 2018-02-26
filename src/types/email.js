const { SchemaBuilder } = require("../operations.js");

SchemaBuilder.addType('Email',
  `#User email object
  type Email {
    address: String
    verified: Boolean
    primary: Boolean
  }`,
  {
    address(value) {
      return value.address;
    },
    verified(value) {
      return value.verified;
    },
    primary(value) {
      return value.main;
    },
  }
);