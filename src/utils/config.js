"use strict";

class Config {
  constructor() {
    this.defaults = {};
    this.defaults[Config.PORT] = 5001;
  }

  get(key) {
    if (process.hasOwnProperty(key)) {
      return process[key];
    }
    if (this.defaults.hasOwnProperty(key)) {
      return this.defaults[key];
    }
    return null;
  }
}
Config.PORT = "PORT";

module.exports = Config;