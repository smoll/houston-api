class HelmConfig {
  constructor(config) {
    this.config = config;
  }

  getKey(path) {
    const keys = path.split(".");
    let search = this.config;
    for(let key of keys) {
      if (!search.hasOwnProperty(key)) {
        return null;
      }
      search = search[key];
    }
    return search;
  }

  setKey(path, value) {
    const keys = path.split(".");

    let last = null;
    let search = this.config;
    for(let key of keys) {
      if (last !== null) {
        if (!search.hasOwnProperty(last)) {
          search[last] = {};
        }
        search = search[last];
      }
      last = key;
    }
    search[last] = value;
  }

  get() {
    return this.config;
  }

  set(config) {
    this.config = config;
  }
}

module.exports = HelmConfig;