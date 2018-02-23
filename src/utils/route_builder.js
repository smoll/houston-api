const CommonUtil = require("./common.js");

class RouteBuilder {
  constructor(express, application) {
    this.express = express;
    this.application = application;
    this.prefix_stack = [];
  }

  buildPrefix(routeInstaance) {
    let prefixPath = this.prefix_stack.join("/");
    let routePath = CommonUtil.trimSlashes(routeInstaance.route());

    routePath = `/${routePath}`;

    if (prefixPath.length > 0) {
      routePath = `/${prefixPath}${routePath}`;
    }

    return routePath;
  }

  group(prefix, wrapper) {
    this.prefix_stack.push(CommonUtil.trimSlashes(prefix));
    wrapper();
    this.prefix_stack.pop();
  }

  registerRoute(routeClass) {
    let routeInstance = new routeClass(this.application);
    this.express[routeInstance.method()](this.buildPrefix(routeInstance), (req, res) => {
      return routeInstance.action(req, res);
    });
  }

  registerRoutes(routeClasses) {
    for(let routeClass of routeClasses) {
      this.registerRoute(routeClass);
    }
  }
}

module.exports = RouteBuilder;