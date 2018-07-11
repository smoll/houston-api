const URL = require("url");

const BaseRoute = require("./base.js");

class AuthorizationRoute extends BaseRoute {
  route() {
    return "authorization";
  }

  method() {
    return ["get", "post"];
  }

  async action(req, res) {
    try {
      const context = await this.service("auth").authenticateRequest(req.headers.authorization);
      context.req = null;
      context.res = null;

      const requestPayload = URL.parse(req.headers["x-original-url"]);

      const hostname = requestPayload.hostname;
      const subdomains = hostname.split('.');

      let subdomain = subdomains[0];

      if (["grafana", "prometheus"].indexOf(subdomain) === -1) {
        const matches = subdomain.match(/^([\w]+-[\w]+-[\d]+)-(airflow|flower)/);
        if (matches) {
          const releaseName = matches[1];
          // override subdomain for simplicity when checking authorization
          subdomain = matches[2];

          const deployment = await this.service("deployment").fetchDeploymentByReleaseName(releaseName);

          context.resources.deployment = deployment;
          context.resources.workspace = deployment.workspace;
        }
      }

      await this.service("common").resolveRequesterPermissions(context);

      switch (subdomain) {
        case "grafana":
          if (context.hasPermissions("global_deployment_external")) {
            return this.granted(res);
          }
          break;
        case "airflow":
        case "flower":
          if (context.hasPermissions("user_deployment_external") || context.hasPermissions("global_deployment_external")) {
            return this.granted(res);
          }
          break;
        default:
          this.info(`Authorization for unknown resource (${subdomain}) requested`) ;
          break;
      }
      return this.denied(res);
    } catch (err) {
      this.error(err.message);
      this.denied(res);
    }
  }

  denied(res) {
    res.status(401).end("Denied");
  }

  granted(res) {
    res.status(200).end("Granted");
  }
}

module.exports = AuthorizationRoute;