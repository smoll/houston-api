module.exports = [

  // =========
  // Queries
  // =========

  require("./query/auth_config.js"),
  require("./query/deployments.js"),
  require("./query/deployment_config.js"),
  require("./query/groups.js"),
  require("./query/self.js"),
  require("./query/workspaces.js"),
  require("./query/users.js"),
  require("./query/service_accounts.js"),
  require("./query/log.js"),

  // =========
  // Mutations
  // =========

  // User Operations
  require("./mutation/create_token.js"),
  require("./mutation/create_user.js"),
  require("./mutation/update_user.js"),

  // Deployment Operations
  require("./mutation/create_deployment.js"),
  require("./mutation/update_deployment.js"),
  require("./mutation/delete_deployment.js"),

  // Workspace Operations
  require("./mutation/create_workspace.js"),
  require("./mutation/delete_workspace.js"),
  require("./mutation/update_workspace.js"),
  require("./mutation/workspace_add_user.js"),
  require("./mutation/workspace_remove_user.js"),

  // Service Account Operations
  require("./mutation/create_service_account.js"),
  require("./mutation/update_service_account.js"),
  require("./mutation/delete_service_account.js"),

  // Group Operations
  require("./mutation/group_add_user.js"),
  require("./mutation/group_remove_user.js"),

  // =========
  // Subscriptions
  // =========

];
