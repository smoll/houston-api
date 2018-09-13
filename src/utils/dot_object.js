const _ = require("lodash");

class DotObject {
  constructor(value = {}) {
    this.object = value;
    this.isDotObject = true;
  }

  get(path, defaultValue = null) {
    if (!path) {
      return this.object;
    }
    const keys = path.split(".");
    let search = this.object;
    for(let key of keys) {
      if (!search.hasOwnProperty(key)) {
        return defaultValue;
      }
      if(!_.isObject(search)) {
        return defaultValue;
      }
      search = search[key];
    }
    return search;
  }

  set(path, value) {
    if (!path || path.length === 0) {
      this.object = value;
    }
    const keys = path.split(".");

    let last = null;
    let search = this.object;
    for(let key of keys) {
      if (last !== null) {
        if (!search.hasOwnProperty(last)) {
          search[last] = {};
        }
        if (!_.isObject(search)) {
          throw new Error("Key not an object");
        }
        search = search[last];
      }
      last = key;
    }
    search[last] = value;
  }

  append(path, value) {
    let array = this.get(path);

    if (array === null) {
      return this.set(path, [value])
    }
    if (_.isArray(array)) {
      return array.push(value);
    }
    throw new Error("Path exists already, but isn't an array");
  }

  remove(path, value) {
    const array = this.get(path);
    if (array === null || !_.isArray(array)) {
      return;
    }
    array.splice(array.indexOf(value), 1);
  }

  clear(path) {
    if (!path) {
      return this.object = {};
    }
    const keys = path.split(".");

    let last = null;
    let search = this.object;
    for(let key of keys) {
      if (last !== null) {
        if (!search.hasOwnProperty(last)) {
          search[last] = {};
        }
        if (!_.isObject(search)) {
          return false;
        }
        search = search[last];
      }
      last = key;
    }
    delete search[last];
    return true;
  }

  merge() {
    _.merge(this.object, ...Object.values(arguments).map((config) => {
      if(config.isDotObject) {
        return config.get();
      }
      return config;
    }));
  }
}

module.exports = DotObject;