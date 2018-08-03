const URL = require("url");
const _ = require("lodash");
const { BaseRoute } = require("sealab");

const DockerJWT = require("../utils/docker_jwt.js");
const Config = require("../utils/config.js");

class RegistryRoute extends BaseRoute {
  route() {
    return "registry";
  }

  method() {
    return ["get", "post"];
  }

  async action(req, res) {
    try {
      if (!req.headers["x-original-uri"]) {
        return this.unknown(res, "Unknown registry service request");
      }

      let authorization = req.headers.authorization;

      if (!authorization) {
        return this.unauthorized(res, "No authorization credentials specified");
      }

      let session = null;
      let isRegistry = false;

      if (authorization.substr(0, 5) === "Basic") {
        authorization = authorization.substr(6);

        if (this.isRegistryAuth(authorization)) {
          session = { userUuid: function() { return "registry" } };
          isRegistry = true;
        } else {

          const creds = Buffer.from(authorization, 'base64').toString().split(":");

          let token;
          if (creds.length === 1) {
            token = creds[0];
          } else {
            token = creds[1];
          }

          session = await this.service("auth").authenticateRequest(token);

          if (!session.userUuid()) {
            if (session.token.expired) {
              return this.unauthorized(res, "Authorization token expired, please login again");
            }
            if (!session.token.valid) {
              return this.unauthorized(res, "Authorization token invalid, please login again");
            }
          }
        }

        const dockerJWT = new DockerJWT();

        let payload = [];

        const requestPayload = URL.parse(req.headers["x-original-uri"]);

        const queryArgs = this.parseQuery(requestPayload.query);

        if (queryArgs.scope) {
          let data;
          if (!_.isArray(queryArgs.scope)) {
            queryArgs.scope = [queryArgs.scope];
          }
          for (let scope of queryArgs.scope) {
            data = this.scopeExtractReleaseName(scope);
            if (data) {
              break;
            }
          }

          if (!data) {
            return this.unknown(res, "Unknown scope, cannot determine repository or image ");
          }

          // if registry, skip permission checks
          if(!isRegistry) {
            session.resources.deployment = await this.service("deployment").fetchDeploymentByReleaseName(data.release);

            await this.service("common").resolveRequesterPermissions(session);

            if (!session.hasPermissions("user_deployment_images")) {
              return this.denied(res, "You do not have authorization to manage deployment images");
            }
          }

          payload.push({
            type: data.type,
            name: `${data.release}/${data.image}`,
            actions: data.actions
          })
        }

        const token = await dockerJWT.generate(session.userUuid(), payload);

        const json = JSON.stringify({
          token: token,
          expires_in: 3600,
          issued_at: new Date().toISOString(),
        });
        res.set("Content-Type", "application/json");
        return res.status(200).end(json);
      } else {
        return this.unauthorized(res, "Unknown authentication pattern")
      }


    } catch (err) {
      this.error(err.message);
      this.unauthorized(res, "Authorization error");
    }
  }

  parseQuery(query) {
    let result = {};
    let pairs = query.split("&");
    for(let pair of pairs) {
      let kv = pair.split("=");
      const key = kv[0];
      const value = decodeURIComponent(kv[1]);
      if (result[key] === undefined) {
        result[key] = value;
      } else {
        if (!_.isArray(result[key])) {
          result[key] = [result[key]];
        }
        result[key].push(value);
      }
    }
    return result;
  }

  scopeExtractReleaseName(scope) {
    const matches = scope.match(/(repository):([a-z]+-[a-z]+-[0-9]{0,4})\/(airflow):([a-z,]+)/);
    if (matches) {
      return {
        type: matches[1],
        release: matches[2],
        image: matches[3],
        actions: matches[4].split(",")
      }
    }
    return null;
  }

  isRegistryAuth(authToken) {
    let registryAuth = Config.get(Config.REGISTRY_AUTH)
    try {
      registryAuth = JSON.parse(registryAuth);
      for(let auth of Object.keys(registryAuth.auths)) {
        if (registryAuth.auths[auth].auth === authToken) {
          return true;
        }
      }
      return false;
    } catch (err) {
      this.error(err.message);
      return false;
    }
  }

  denied(res, message) {
    return this.errorResponse(res, "DENIED", message);
  }

  unauthorized(res, message) {
    return this.errorResponse(res, "UNAUTHORIZED", message);
  }

  unknown(res, message) {
    return this.errorResponse(res, "NAME_UNKNOWN", message);
  }

  errorResponse(res, code, message) {
    // Error docs https://docs.docker.com/registry/spec/api/#errors-2
    const payload = {
      "errors": [{
        "code": code,
        "message": message,
        "details": [],
      }]
    };

    return res.status(401).end(JSON.stringify(payload));
  }
}

module.exports = RegistryRoute;