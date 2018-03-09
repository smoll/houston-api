const { SchemaBuilder } = require("../operations.js");

SchemaBuilder.addType('Organization',
  `#Organization object
  type Organization {
    uuid: ID
  }`,
  {
    uuid(value) {
      return "Not implemented yet";
    }
  }
);