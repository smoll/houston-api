// TODO: Move defaults to .env files

let HelmConfig = null;

class Config {
  static setDefaults(defaults) {
    Config.defaults = Object.assign({}, defaults);
    Config.defaults[Config.NODE_ENV] = "development";
    Config.defaults[Config.PORT] = 5001;
    Config.defaults[Config.API_ENDPOINT_URL] = "/v1";
    Config.defaults[Config.WEBSOCKET_ENDPOINT_URL] = "/ws";
    Config.defaults[Config.PLAYGROUND_ENDPOINT_URL] = "/playground";
    Config.defaults[Config.DEBUG_DB] = "false";
    Config.defaults[Config.JWT_PASSPHRASE] = "insecure_passphrase";
    Config.defaults[Config.AUTH_STRATEGY] = "local";
    Config.defaults[Config.HELM_GLOBAL_CONFIG] = {};
    Config.defaults[Config.HELM_ASTRO_REPO] = "https://helm.astronomer.io/";
    Config.defaults[Config.HELM_REPO_EDGE] = "false";

    Config.defaults[Config.REGISTRY_CERT_PATH] = "/tmp/houston/";
    Config.defaults[Config.REGISTRY_ISSUER] = "houston";
    Config.defaults[Config.REGISTRY_SERVICE] = "docker-registry";
    Config.defaults[Config.SERVER_TIMEOUT] = 120000; // ms
  }

  static get(key) {
    if (process.env.hasOwnProperty(key)) {
      return process.env[key];
    }
    if (this.defaults.hasOwnProperty(key)) {
      return Config.defaults[key];
    }
    return null;
  }

  static isProd() {
    return this.get(Config.NODE_ENV) === "production";
  }

  static helmConfig(key = null) {
    if (!HelmConfig) {
      HelmConfig = JSON.parse(Config.get(Config.HELM_GLOBAL_CONFIG));
    }
    if (key) {
      return HelmConfig[key];
    }
    return HelmConfig;
  }

  static baseDomain(includeProtocol = false) {
    const base = this.helmConfig(Config.GLOBAL_BASE_DOMAIN);
    if (!includeProtocol) {
      return base;
    }
    if (this.isProd()) {
      return `https://${base}`;
    }
    return `http://${base}`;
  }

  static auth0Base() {
    const base = Config.get(Config.AUTH0_BASE_DOMAIN);
    if (base[base.length - 1] === "/") {
      return base.substr(0, base.length - 1);
    }
    return base;
  }

  static orbitDomain(includeProtocol = false) {
    const base = Config.get(Config.BASE_URL_ORBIT);
    if (base[base.length - 1] === "/") {
      return base.substr(0, base.length - 1);
    }
    if (!includeProtocol) {
      return base;
    }
    if (this.isProd()) {
      return `https://${base}`;
    }
    return `http://${base}`;
  }

  static houstonDomain(includeProtocol = false) {
    const base = Config.get(Config.BASE_URL_HOUSTON);
    if (base[base.length - 1] === "/") {
      return base.substr(0, base.length - 1);
    }
    if (!includeProtocol) {
      return base;
    }
    if (this.isProd()) {
      return `https://${base}`;
    }
    return `http://${base}`;

  }

}

Config.defaults = {};

Config.NODE_ENV = "NODE_ENV";
Config.PORT = "PORT";
Config.API_ENDPOINT_URL = "API_ENDPOINT_URL";
Config.WEBSOCKET_ENDPOINT_URL = "WEBSOCKET_ENDPOINT_URL";
Config.PLAYGROUND_ENDPOINT_URL = "PLAYGROUND_ENDPOINT_URL";
Config.HOUSTON_POSTGRES_URI = "HOUSTON_POSTGRES_URI";
Config.AIRFLOW_POSTGRES_URI = "AIRFLOW_POSTGRES_URI";
Config.SMTP_URI = "SMTP_URI";
Config.SMTP_FROM = "SMTP_FROM";
Config.DEBUG_DB = "DEBUG_DB";
Config.JWT_PASSPHRASE = "JWT_PASSPHRASE";
Config.REGISTRY_CERT_PATH = "REGISTRY_CERT_PATH";
Config.REGISTRY_ISSUER = "REGISTRY_ISSUER";
Config.REGISTRY_AUTH = "REGISTRY_AUTH";
Config.REGISTRY_SERVICE = "REGISTRY_SERVICE";
Config.HELM_GLOBAL_CONFIG = "HELM_GLOBAL_CONFIG";
Config.HELM_ASTRO_REPO = "HELM_ASTRO_REPO";
Config.HELM_REPO_EDGE = "HELM_REPO_EDGE";
Config.COMMANDER_HOST = "COMMANDER_HOST";
Config.COMMANDER_PORT = "COMMANDER_PORT";
Config.AUTH_STRATEGY = "AUTH_STRATEGY"; // local, auth0_oauth, google_oauth
Config.GOOGLE_CLIENT_ID = "GOOGLE_CLIENT_ID";
Config.GITHUB_CLIENT_ID = "GITHUB_CLIENT_ID";
Config.AUTH0_CUSTOM = "AUTH0_CUSTOM";
Config.AUTH0_CLIENT_ID = "AUTH0_CLIENT_ID";
Config.AUTH0_BASE_DOMAIN = "AUTH0_BASE_DOMAIN";
Config.AUTH0_EXTERNAL_LOGIN = "AUTH0_EXTERNAL_LOGIN";
Config.BASE_URL_ORBIT = "BASE_URL_ORBIT";
Config.BASE_URL_HOUSTON = "BASE_URL_HOUSTON";
Config.SERVER_TIMEOUT = "SERVER_TIMEOUT";

Config.GLOBAL_PLATFORM_VERSION = "releaseVersion";
Config.GLOBAL_PLATFORM_RELEASE = "releaseName";
Config.GLOBAL_PLATFORM_NAMESPACE = "releaseNamespace";
Config.GLOBAL_BASE_DOMAIN = "baseDomain";
module.exports = Config;
