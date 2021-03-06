let NodeCache = require("node-cache");
let Semver = require("semver");
let YAML = require("yamljs");

let Request = require("./request.js");

class HelmMetadata {
  constructor(repoUrl) {
    this.request = new Request(repoUrl);
    this.cache = new NodeCache();
  }

  async downloadChart(chartName, chartVersion) {
    let key = this.cacheKey(chartName, chartVersion);
    const url = `configs/${key}.yaml`;
    try {
      return await this.request.get(url);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async downloadRepo() {
    try {
      return await this.request.get("index.yaml");
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getChart(chartName, chartVersion) {
    let key = this.cacheKey(chartName, chartVersion);
    let value = this.cache.get(key);
    if (!value) {
      try {
        value = await this.downloadChart(chartName, chartVersion);
        value = YAML.parse(value);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return value;
  }

  async getRepo() {
    let key = "index";
    let value = this.cache.get(key);
    if (!value) {
      try {
        value = await this.downloadRepo();
        value = YAML.parse(value);
      } catch (err) {
        return Promise.reject(err);
      }
      this.cache.set(key, value, HelmMetadata.REPO_CACHE_EXPIRE);
    }
    return value;
  }

  async latestChart(chartName, platformVersion) {
    return platformVersion;
  }

  cacheKey(chartName, chartVersion) {
    return `${chartName}-${chartVersion}`;
  }

}
HelmMetadata.REPO_CACHE_EXPIRE = 3600; // 1 hour
module.exports = HelmMetadata;