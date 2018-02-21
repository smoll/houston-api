class Config {
  static setDefaults(defaults) {
    Config.defaults = Object.assign({}, defaults);
    Config.defaults[Config.NODE_ENV] = "development";
    Config.defaults[Config.PORT] = 5001;
    Config.defaults[Config.API_ENDPOINT_URL] = "/v1";
    Config.defaults[Config.WEBSOCKET_ENDPOINT_URL] = "/ws";
    Config.defaults[Config.PLAYGROUND_ENDPOINT_URL] = "/playground";
    Config.defaults[Config.DEBUG_DB] = false;
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

module.exports = Config;