const { SchemaBuilder } = require("./operations.js");

SchemaBuilder.addTypeDef(`
  scalar JSON
`);

SchemaBuilder.addTypeDef(`
  scalar Date
`);

SchemaBuilder.addTypeDef(`
  schema {
    #query: Query
    mutation: Mutation
    #subscription: Subscription
  }
`);

