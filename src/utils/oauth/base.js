const Config = require("../config.js");

class BaseOAuth {
  constructor(clientId, redirectUrl) {
    this.provider = "unknown";
    this.client = null;
    this.clientId = clientId;
    this.redirectUrl = redirectUrl;

    if (!this.clientId) {
      throw new Error("OAuth requires a clientId");
    }
    if (!this.redirectUrl) {
      throw new Error("OAuth requires a redirectUrl");
    }
  }

  originUrl() {
    let baseDomain = `${Config.houstonDomain(true)}`;
    if (baseDomain[baseDomain.length - 1] !== "/") {
      baseDomain = `${baseDomain}/`;
    }
    return `${baseDomain}oauth`;
  }

  generateState(state, integration = "self") {
    return JSON.stringify({
      ...{
        provider: this.provider,
        integration: integration,
        origin: this.originUrl(),
      },
      ...state
    });
  }

  generateAuthUrl(){
    throw new Error("#generateAuthUrl not implemented");
  }

  validateToken() {
    throw new Error("#validateToken not implemented");
  }

  getUserData() {
    throw new Error("#getUserData not implemented");
  }

  normalizeExpire(expire) {
    return expire;
  }
}

module.exports = BaseOAuth;