const { SchemaBuilder } = require("../operations.js");

const AuthUser = require("./auth_user.js");
const Deployment = require("./deployment.js");
const Email = require("./email.js");
const Team = require("./team.js");
const Token = require("./token.js");
const TokenPayload = require("./token_payload.js");
const User = require("./user.js");

// TypeDefs that are not GQL types (resolvable objects)

SchemaBuilder.addTypeDef(`
  scalar JSON
`);

SchemaBuilder.addTypeDef(`
  scalar Date
`);

SchemaBuilder.addTypeDef(`
  scalar Uuid
`);

SchemaBuilder.addTypeDef(`
  schema {
    query: Query
    mutation: Mutation
    #subscription: Subscription
  }
`);

SchemaBuilder.addTypeDef(`
  enum ModuleType {
    AIRFLOW
    CLICKSTREAM
  }
`);

module.exports = [
  AuthUser,
  Deployment,
  Email,
  Team,
  Token,
  TokenPayload,
  User
];