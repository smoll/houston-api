const { SchemaBuilder } = require("../operations.js");

// TypeDefs that are not GQL types (resolvable objects)

SchemaBuilder.addTypeDef(`
  scalar JSON
`);

SchemaBuilder.addTypeDef(`
  scalar Date
`);

SchemaBuilder.addTypeDef(`
  schema {
    query: Query
    mutation: Mutation
    #subscription: Subscription
  }
`);

// Full GQL Type definitions
require("./decoded_token.js");
require("./deployment");
require("./email.js");
require("./organization.js");
require("./status_message.js");
require("./team.js");
require("./token.js");
require("./user.js");