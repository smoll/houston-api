const RouterBuilder = require("../utils/route_builder.js");

module.exports = (express, application) => {
  const routerBuilder = new RouterBuilder(express, application);

  // root routes
  routerBuilder.registerRoute(require("./healthz.js"));

  // webhook routes
  routerBuilder.group("webhooks", () => {

  });
};