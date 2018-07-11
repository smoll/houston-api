const Config = require("./config.js");

module.exports = {
  setAuthCookie(response, jwt, expiresAt) {
    const baseDomain = Config.baseDomain();

    if (!baseDomain ) {
      throw new Error("Cannot authenticate, no base domain set");
    }

    response.cookie("astronomer_auth", jwt, {
      domain: `.${baseDomain}`,
      path: '/',
      expires: new Date(expiresAt * 1000).toUTCString(),
      secure: true
    });
  }
};