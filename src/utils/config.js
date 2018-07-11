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
    Config.defaults[Config.HELM_ASTRO_REPO] = "http://helm.astronomer.io/";
    Config.defaults[Config.HELM_REPO_EDGE] = "false";


    Config.defaults[Config.DOCKER_CERT_PATH] = "/tmp/houston/";
    Config.defaults[Config.DOCKER_ISSUER] = "houston";
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

  static helmConfig() {
    if (!HelmConfig) {
      HelmConfig = JSON.parse(Config.get(Config.HELM_GLOBAL_CONFIG));
    }
    return HelmConfig;
  }

  static baseDomain() {
    return this.helmConfig()["baseDomain"];
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
Config.AIRFLOW_REDIS_URI = "AIRFLOW_REDIS_URI";
Config.DEBUG_DB = "DEBUG_DB";
Config.JWT_PASSPHRASE = "JWT_PASSPHRASE";
Config.DOCKER_CERT_PATH = "DOCKER_CERT_PATH";
Config.DOCKER_ISSUER = "DOCKER_ISSUER";
Config.HELM_GLOBAL_CONFIG = "HELM_GLOBAL_CONFIG";
Config.HELM_ASTRO_REPO = "HELM_ASTRO_REPO";
Config.HELM_REPO_EDGE = "HELM_REPO_EDGE";
Config.AUTH_STRATEGY = "AUTH_STRATEGY";
Config.COMMANDER_HOST = "COMMANDER_HOST";
Config.COMMANDER_PORT = "COMMANDER_PORT";
Config.GOOGLE_OAUTH_REDIRECT_URL = "GOOGLE_OAUTH_REDIRECT_URL";
Config.GOOGLE_CLIENT_ID = "GOOGLE_CLIENT_ID";
Config.GOOGLE_CLIENT_SECRET = "GOOGLE_CLIENT_SECRET";

module.exports = Config;