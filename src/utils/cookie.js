const Config = require("./config.js");

module.exports = {
  setAuthCookie(response, jwt, expiresAt) {
    const globalConfig = JSON.parse(Config.get(Config.HELM_GLOBAL_CONFIG));

    if (!globalConfig['baseDomain']) {
      throw new Error("Cannot authenticate, no base domain set");
    }
    response.cookie("astronomer_auth", jwt, {
      domain: `.${globalConfig['baseDomain']}`,
      path: '/',
      expires: new Date(expiresAt),
      secure: true
    });
  }
};