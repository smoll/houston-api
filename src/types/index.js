const { SchemaBuilder } = require("../operations.js");

const AuthConfig = require("./auth_config.js");
const AuthUser = require("./auth_user.js");
const Deployment = require("./deployment.js");
const Email = require("./email.js");
const Group = require("./group.js");
const Invite = require("./invite.js");
const ServiceAccount = require("./service_account.js");
const SystemSetting = require("./system_setting.js");
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

SchemaBuilder.addTypeDef(`
  enum AuthStrategy {
    LOCAL
    GOOGLE_OAUTH
  }
`);

SchemaBuilder.addTypeDef(`
  enum ServiceAccountEntityType {
    SYSTEM
    TEAM
    DEPLOYMENT
    USER
  }
`);

SchemaBuilder.addTypeDef(`
  enum EntityType {
    SYSTEM
    TEAM
    DEPLOYMENT
    USER
  }
`);

SchemaBuilder.addTypeDef(`
  enum GroupEntityType {
    SYSTEM
    TEAM
    DEPLOYMENT
  }
`);

module.exports = [
  AuthConfig,
  AuthUser,
  Deployment,
  Email,
  Invite,
  Group,
  Team,
  Token,
  TokenPayload,
  ServiceAccount,
  User
];