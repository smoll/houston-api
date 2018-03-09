const { SchemaBuilder } = require("../operations.js");

SchemaBuilder.addType('Team',
  `#Team object
  type Team {
    uuid: ID
  }`,
  {
    uuid(value) {
      return "Not implemented yet";
    }
  }
);