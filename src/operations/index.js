module.exports = [

  // queries
  require("./query/fetch_deployments.js"),
  require("./query/fetch_deployment_config.js"),

  // mutations
  require("./mutation/create_token.js"),
  require("./mutation/create_user.js"),
  require("./mutation/update_user.js"),

  require("./mutation/create_deployment.js"),
  require("./mutation/update_deployment.js"),
  require("./mutation/delete_deployment.js"),

  // subscriptions

];
