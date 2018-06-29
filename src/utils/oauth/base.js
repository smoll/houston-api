class BaseOAuth {
  constructor(clientId, clientSecret, redirectUrl) {
    this.client = null;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUrl = redirectUrl;

    if (!this.clientId) {
      throw new Error("OAuth requires a clientId");
    }
    if (!this.clientSecret) {
      throw new Error("OAuth requires a clientSecret");
    }
    if (!this.redirectUrl) {
      throw new Error("OAuth requires a redirectUrl");
    }
  }

  generateAuthUrl(){
    throw new Error("Not implemented");
  }

  exchangeToken() {
    throw new Error("Not implemented");
  }

  getUserData() {
    throw new Error("Not implemented");
  }
}

module.exports = BaseOAuth;