const RouterBuilder = require("../utils/route_builder.js");

module.exports = (express, application) => {
  const routerBuilder = new RouterBuilder(express, application);

  // root routes
  routerBuilder.registerRoute(require("./healthz.js"));
  routerBuilder.registerRoute(require("./authorization.js"));
  routerBuilder.registerRoute(require("./registry.js"));

  // webhook routes
  routerBuilder.group("v1", () => {

    // webhook routes
    routerBuilder.group("webhooks", () => {

      routerBuilder.registerRoute(require("./v1/webhooks/registry_events.js"));

    });

  });
};