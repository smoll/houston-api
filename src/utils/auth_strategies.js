
const Config = require("./config.js");
const GoogleOAuth = require("./oauth/google.js");

class OAuthData {
  constructor(strategy) {
    this.providerType = strategy.replace("_oauth", "");
    this.providerUserId = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.expires = null;
    this.jwtPayload = null;
    this.profile = {
      email: null,
      firstName: null,
      lastName: null,
      fullName: null,
      pictureUrl: null
    }
  }
}

class AuthStrategies {
  constructor() {
    this.strategies = {};
    this.oauthUtil = {};

    const enabledStrategies = Config.get(Config.AUTH_STRATEGY).split(",");

    this.initLocal(enabledStrategies.indexOf(AuthStrategies.LOCAL) >= 0);
    this.initGoogle(enabledStrategies.indexOf(AuthStrategies.GOOGLE) >= 0);
  }

  initLocal(enabled) {
    this.strategies[AuthStrategies.LOCAL] = enabled;
  }

  initGoogle(enabled) {
    this.strategies[AuthStrategies.GOOGLE] = enabled;

    if (!enabled) {
      this.oauthUtil[AuthStrategies.GOOGLE] = null;
      return false;
    }

    this.oauthUtil[AuthStrategies.GOOGLE] = new GoogleOAuth(
      Config.get(Config.GOOGLE_CLIENT_ID),
      Config.get(Config.GOOGLE_CLIENT_SECRET),
      Config.get(Config.GOOGLE_OAUTH_REDIRECT_URL)
    );
    return true;
  }

  isStrategy(strategy) {
    return AuthStrategies.ALL.indexOf(strategy) >= 0;
  }

  isEnabled(strategy) {
    if (!this.isStrategy(strategy)) {
      throw new Error("Unknown auth strategy");
    }
    return this.strategies[strategy];
  }

  isOAuth(strategy) {
    return this.oauthUtil.hasOwnProperty(strategy);
  }

  defaultStrategy() {
    return AuthStrategies.LOCAL;
  }

  getOAuthUtil(strategy) {
    return this.oauthUtil[strategy];
  }

  getOAuthUrl(strategy, state) {
    return this.getOAuthUtil(strategy).generateAuthUrl(state);
  }

  async getUserData(strategy, token) {
    const data = new OAuthData(strategy);

    // exchange code for access_token and possibly refresh_token.
    // depending on the oauth provider, might also contain meta data
    await this.getOAuthUtil(strategy).exchangeToken(token, data);

    // parse or fetch user/profile data
    return await this.getOAuthUtil(strategy).getUserData(data);
  }
}

AuthStrategies.LOCAL = "local";
AuthStrategies.GOOGLE = "google_oauth";

AuthStrategies.ALL = [
  AuthStrategies.LOCAL,
  AuthStrategies.GOOGLE,
];

module.exports = AuthStrategies;