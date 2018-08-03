const URL = require("url");

const { BaseRoute } = require("sealab");

class AuthorizationRoute extends BaseRoute {
  route() {
    return "authorization";
  }

  method() {
    return ["get", "post"];
  }

  async action(req, res) {
    try {
      let authorization = req.headers.authorization;
      if (!authorization) {
        authorization = this.getCookie(req.headers.cookie, "astronomer_auth")
      }
      if (!authorization) {
        return this.denied(res);
      }

      const session = await this.service("auth").authenticateRequest(authorization);

      const requestPayload = URL.parse(req.headers["x-original-url"]);

      const hostname = requestPayload.hostname;
      const subdomains = hostname.split('.');

      let subdomain = subdomains[0];

      if (["grafana"].indexOf(subdomain) === -1) {
        const matches = subdomain.match(/^([\w]+-[\w]+-[\d]+)-(airflow|flower)/);
        if (matches) {
          const releaseName = matches[1];
          // override subdomain for simplicity when checking authorization
          subdomain = matches[2];

          const deployment = await this.service("deployment").fetchDeploymentByReleaseName(releaseName);

          session.resources.deployment = deployment;
          session.resources.workspace = deployment.workspace;
        }
      }

      await this.service("common").resolveRequesterPermissions(session);

      switch (subdomain) {
        case "grafana":
          if (session.hasPermissions("global_deployment_external")) {
            return this.granted(res);
          }
          break;
        case "airflow":
        case "flower":
          if (session.hasPermissions("user_deployment_external") || session.hasPermissions("global_deployment_external")) {
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

  getCookie(cookies, name) {
    if (!cookies) {
      return null;
    }
    for(let cookie of cookies.split(";")) {
      const kv = cookie.trim().split("=");
      const key = kv[0];
      const value = kv[1];
      if (key === name) {
        return value
      }
    }
    return null;
  }

  denied(res) {
    res.status(401).end("Denied");
  }

  granted(res) {
    res.status(200).end("Granted");
  }
}

module.exports = AuthorizationRoute;