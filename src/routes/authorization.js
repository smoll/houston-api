const URL = require("url");

const BaseRoute = require("./base.js");

class Authorization extends BaseRoute {
  route() {
    return "authorization";
  }

  method() {
    return ["get", "post"];
  }

  async action(req, res) {
    try {
      this.granted(res);
      req.headers.authorization = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNjViZTU0MDQtNzdmMS00MzRjLTgyNzUtMDY2YWVkNWQ0MzM2IiwiaWF0IjoxNTMxMTU5NzkyLCJleHAiOjE1MzEyNDYxOTJ9.1TyVGvVWxNQeCQ8W8oMj6xImkzB3O3sMdujCGWSyQ6M";
      const context = await this.service("auth").authenticateRequest(req.headers.authorization);
      context.req = null;
      context.res = null;

      // console.log(context);
      const requestUrl = URL.parse(req.headers["x-original-url"]);

      const hostname = requestUrl.hostname;
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
        case "prometheus":
          // if superadmin
          return this.granted(res);
        case "airflow":
        case "flower":
          return this.granted(res);
        default:
          return this.denied(res);
      }
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

module.exports = Authorization;