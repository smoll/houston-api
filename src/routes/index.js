const { RoutesManager } = require("sealab");

module.exports = (express, application) => {
  const routesManager = new RoutesManager(express, application);

  // root routes
  routesManager.registerRoute(require("./healthz.js"));
  routesManager.registerRoute(require("./authorization.js"));
  routesManager.registerRoute(require("./registry.js"));

  // webhook routes
  routesManager.group("v1", () => {

    // webhook routes
    routesManager.group("webhooks", () => {

      routesManager.registerRoute(require("./v1/webhooks/registry_events.js"));

    });

  });
};