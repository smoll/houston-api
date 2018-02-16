"use strict";

class Config {
  constructor(defaults) {
    this.defaults = Object.assign({}, defaults);
    this.defaults[Config.PORT] = 5001;
  }

  get(key) {
    if (process.env.hasOwnProperty(key)) {
      return process.env[key];
    }
    if (this.defaults.hasOwnProperty(key)) {
      return this.defaults[key];
    }
    return null;
  }
}
Config.PORT = "PORT";

module.exports = Config;