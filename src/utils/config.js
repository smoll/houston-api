class Config {
  static setDefaults(defaults) {
    Config.defaults = Object.assign({}, defaults);
    Config.defaults[Config.NODE_ENV] = "development";
    Config.defaults[Config.PORT] = 5001;
    Config.defaults[Config.API_ENDPOINT_URL] = "/v1";
    Config.defaults[Config.WEBSOCKET_ENDPOINT_URL] = "/ws";
    Config.defaults[Config.PLAYGROUND_ENDPOINT_URL] = "/playground";
    Config.defaults[Config.DEBUG_DB] = false;
    Config.defaults[Config.JWT_PASSPHRASE] = "insecure_passphrase";
    Config.defaults[Config.AUTH_STRATEGY] = "local";
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
}

Config.defaults = {};

Config.NODE_ENV = "NODE_ENV";
Config.PORT = "PORT";
Config.API_ENDPOINT_URL = "API_ENDPOINT_URL";
Config.WEBSOCKET_ENDPOINT_URL = "WEBSOCKET_ENDPOINT_URL";
Config.PLAYGROUND_ENDPOINT_URL = "PLAYGROUND_ENDPOINT_URL";
Config.POSTGRES_URI = "POSTGRES_URI";
Config.DEBUG_DB = "DEBUG_DB";
Config.JWT_PASSPHRASE = "JWT_PASSPHRASE";
Config.AUTH_STRATEGY = "AUTH_STRATEGY";
Config.COMMANDER_HOST = "COMMANDER_HOST";
Config.COMMANDER_PORT = "COMMANDER_PORT";

module.exports = Config;