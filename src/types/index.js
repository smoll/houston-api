const { SchemaBuilder } = require("../operations.js");

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
    subscription: Subscription
  }
`);

SchemaBuilder.addTypeDef(`
  enum ModuleType {
    AIRFLOW
    CLICKSTREAM
  }
`);

SchemaBuilder.addTypeDef(`
  enum ServiceAccountEntityType {
    SYSTEM
    WORKSPACE
    DEPLOYMENT
    USER
  }
`);

SchemaBuilder.addTypeDef(`
  enum EntityType {
    SYSTEM
    WORKSPACE
    DEPLOYMENT
    USER
  }
`);

SchemaBuilder.addTypeDef(`
  enum GroupEntityType {
    SYSTEM
    WORKSPACE
    DEPLOYMENT
  }
`);

module.exports = [
  require("./auth_config.js"),
  require("./auth_user.js"),
  require("./deploy_info.js"),
  require("./deployment.js"),
  require("./deployment_config.js"),
  require("./deployment_log.js"),
  require("./deployment_urls.js"),
  require("./email.js"),
  require("./group.js"),
  require("./invite.js"),
  require("./service_account.js"),
  require("./system_setting.js"),
  require("./token.js"),
  require("./token_payload.js"),
  require("./user.js"),
  require("./user_property.js"),
  require("./workspace.js"),
];