
const Config = require("./config.js");
const GoogleOAuth = require("./oauth/google.js");
const Auth0OAuth = require("./oauth/auth0.js");

class OAuthData {
  constructor(strategy) {
    this.providerType = strategy.replace("_oauth", "");
    this.providerUserId = null;
    this.expires = null;
    this.encodedJWT = null;
    this.decodedJWT = null;
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
    this.initAuth0(enabledStrategies.indexOf(AuthStrategies.AUTH0) >= 0);
    this.initGoogle(enabledStrategies.indexOf(AuthStrategies.GOOGLE) >= 0);
    this.initGithub(enabledStrategies.indexOf(AuthStrategies.GITHUB) >= 0);
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

    if (!Config.get(Config.GOOGLE_CLIENT_ID)) {
      this.oauthUtil[AuthStrategies.GOOGLE] = this.oauthUtil[AuthStrategies.AUTH0];
    } else {
      this.oauthUtil[AuthStrategies.GOOGLE] = new GoogleOAuth(Config.get(Config.GOOGLE_CLIENT_ID), this.redirectUrl());
    }
    return true;
  }

  initGithub(enabled) {
    this.strategies[AuthStrategies.GITHUB] = enabled;

    if (!enabled) {
      this.oauthUtil[AuthStrategies.GITHUB] = null;
      return false;
    }

    this.oauthUtil[AuthStrategies.GITHUB] = this.oauthUtil[AuthStrategies.AUTH0];

    return true;
  }

  initAuth0(enabled) {
    this.strategies[AuthStrategies.AUTH0] = enabled;

    if (!enabled) {
      this.oauthUtil[AuthStrategies.AUTH0] = null;
      return false;
    }

    this.oauthUtil[AuthStrategies.AUTH0] = new Auth0OAuth(
      Config.get(Config.AUTH0_CLIENT_ID),
      this.redirectUrl(),
      Config.auth0Base(),
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

  getOAuthUrl(strategy, state, integration) {
    if (!this.isEnabled(strategy)) {
      return null;
    }

    if (strategy === AuthStrategies.AUTH0) {
      integration = this.mapStrategyToAuth0Provider(integration);
      return this.getOAuthUtil(AuthStrategies.AUTH0).generateAuthUrl(state, integration);
    } else {
      return this.getOAuthUtil(strategy).generateAuthUrl(state);
    }
  }

  mapStrategyToAuth0Provider(strategy) {
    switch (strategy) {
      case AuthStrategies.GOOGLE:
        return "google-oauth2";
      case AuthStrategies.GITHUB:
        return "github";
      default:
        return strategy;
    }
  }

  redirectUrl() {
    let baseDomain = `${Config.baseDomain()}`;
    if (baseDomain[baseDomain.length - 1] !== "/") {
      baseDomain = `${baseDomain}/`;
    }
    if (Config.isProd()) {
      return `https://houston.${baseDomain}oauth_redirect`;
    }
    return `http://houston.${baseDomain}oauth_redirect`;
  }

  async getUserData(strategy, jwt, expire) {
    const data = new OAuthData(strategy);
    const oauth = this.getOAuthUtil(strategy);

    data.encodedJWT = jwt;
    data.expires = oauth.normalizeExpire(expire);

    await oauth.validateToken(data);
    return await oauth.getUserData(data);
  }
}

AuthStrategies.LOCAL = "local";
AuthStrategies.GOOGLE = "google_oauth";
AuthStrategies.GITHUB = "github_oauth";
AuthStrategies.AUTH0 = "auth0_oauth";

AuthStrategies.ALL = [
  AuthStrategies.LOCAL,
  AuthStrategies.GOOGLE,
  AuthStrategies.GITHUB,
  AuthStrategies.AUTH0,
];

module.exports = AuthStrategies;