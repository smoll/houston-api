const { SchemaBuilder } = require("../operations.js");

const AuthConfig = require("./auth_config.js");
const AuthUser = require("./auth_user.js");
const DeployInfo = require("./deploy_info.js");
const Deployment = require("./deployment.js");
const DeploymentConfig = require("./deployment_config.js");
const DeploymentLog = require("./deployment_log.js");
const DeploymentUrls = require("./deployment_urls.js");
const Email = require("./email.js");
const Group = require("./group.js");
const Invite = require("./invite.js");
const ServiceAccount = require("./service_account.js");
const SystemSetting = require("./system_setting.js");
const Workspace = require("./workspace.js");
const Token = require("./token.js");
const TokenPayload = require("./token_payload.js");
const User = require("./user.js");
const UserProperty = require("./user_property.js");

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
  AuthConfig,
  AuthUser,
  DeployInfo,
  Deployment,
  DeploymentConfig,
  DeploymentLog,
  DeploymentUrls,
  Email,
  Invite,
  Group,
  Workspace,
  Token,
  TokenPayload,
  ServiceAccount,
  User,
  UserProperty,
];