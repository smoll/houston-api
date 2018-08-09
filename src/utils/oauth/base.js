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

  generateState(state, integration = "self") {
    return JSON.stringify({
      ...{
        provider: this.provider,
        integration: integration,
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