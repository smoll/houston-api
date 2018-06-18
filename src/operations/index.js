module.exports = [

  // queries
  require("./query/fetch_deployments.js"),
  require("./query/deployments.js"),
  require("./query/deployment_config.js"),
  require("./query/teams.js"),
  require("./query/users.js"),
  //
  // // mutations
  require("./mutation/create_token.js"),
  require("./mutation/create_user.js"),
  require("./mutation/update_user.js"),
  //
  require("./mutation/create_deployment.js"),
  require("./mutation/update_deployment.js"),
  require("./mutation/delete_deployment.js"),

  require("./mutation/create_team.js"),
  require("./mutation/delete_team.js"),
  require("./mutation/update_team.js"),

  // subscriptions

];
