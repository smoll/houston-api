module.exports = [

  // queries
  require("./query/fetch_user.js"),

  // mutations
  require("./mutation/create_token.js"),
  require("./mutation/create_user.js"),
  require("./mutation/update_user.js"),

  // subscriptions

];
