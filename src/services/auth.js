const BaseService = require("./base.js");

const _ = require("lodash");
const JWT = require("jsonwebtoken");

const Config = require("../utils/config.js");
const AuthStrategies = require("../utils/auth_strategies.js");
const CookieUtil = require("../utils/cookie.js");

const Session = require("../session.js");

const MAX_DURATION = 7;
const MIN_DURATION = 1;

class AuthService extends BaseService {

  constructor() {
    super(...arguments);
    this.strategyUtil = new AuthStrategies();
  }

  defaultStrategy() {
    return this.strategyUtil.defaultStrategy();
  }

  isStrategy(strategy) {
    return this.strategyUtil.isStrategy(strategy);
  }

  isOAuthStrategy(strategy) {
    return this.strategyUtil.isOAuth(strategy);
  }

  isStrategyEnabled(strategy) {
    return this.strategyUtil.isEnabled(strategy);
  }

  getStrategyInfo(state) {
    const payload = {
      localEnabled: this.strategyUtil.isEnabled(AuthStrategies.LOCAL),
      auth0Enabled: this.strategyUtil.isEnabled(AuthStrategies.AUTH0) && Config.get(Config.AUTH0_EXTERNAL_LOGIN) === "true",
      googleEnabled: this.strategyUtil.isEnabled(AuthStrategies.GOOGLE),
      githubEnabled: this.strategyUtil.isEnabled(AuthStrategies.GITHUB),
      googleOAuthUrl: null,
      githubOAuthUrl: null,
      auth0OAuthUrl: null,
    };

    // if google enabled, add the auth url
    if (payload.googleEnabled) {
      if (Config.get(Config.GOOGLE_CLIENT_ID)) {
        payload.googleOAuthUrl = this.strategyUtil.getOAuthUrl(AuthStrategies.GOOGLE, state);
      } else {
        payload.googleOAuthUrl = this.strategyUtil.getOAuthUrl(AuthStrategies.AUTH0, state, AuthStrategies.GOOGLE);
      }
    }

    if (payload.githubOAuthUrl) {
      if (Config.get(Config.GITHUB_CLIENT_ID)) {
        payload.githubOAuthUrl = this.strategyUtil.getOAuthUrl(AuthStrategies.GITHUB, state);
      } else {
        payload.githubOAuthUrl = this.strategyUtil.getOAuthUrl(AuthStrategies.AUTH0, state, AuthStrategies.GITHUB);
      }
    }

    if (payload.auth0Enabled) {
      payload.auth0OAuthUrl = this.strategyUtil.getOAuthUrl(AuthStrategies.AUTH0, state);
    }

    return payload;
  }

  async authenticateOAuth(strategy, jwt, accessToken, expiration) {
    const data = await this.strategyUtil.getUserData(strategy, jwt, accessToken, expiration);
    return await this.service("oauth_user").authenticateUser(data);
  }

  async authenticateUser(emailOrUsername, password) {
    return this.service("local_user").authenticateUser(emailOrUsername, password);
  }

  async authenticateRequest(authorization) {
    let session;

    // If authorization token is a service
    if (this.isServiceToken(authorization)) {
      // TODO: Do something with service auth
      session = new Session(authorization, Session.REQUESTER_SERVICE);
      return session;
    }

    // Must be a user
    session = new Session(authorization, Session.REQUESTER_USER);

    // only attempt to decodeJWT if there is one
    if(authorization && authorization.length > 0) {
      try {
        let decoded = await this.decodeJWT(authorization);
        let user = await this.service("user").fetchUserByUuid(decoded.uuid, false);
        if (user) {
          session.setAuthUser(user);
        }
      } catch (err) {

        // add session to context, specifying why a token was invalid
        switch(err.message) {
          case "invalid signature":
            session.token.valid = false;
            break;
          case "jwt expired":
            session.token.expired = true;
            break;
          case "jwt malformed":
            session.token.valid = false;
            session.token.expired = true;
            break;
        }
        this.error(err.message);
      }
    }
    return session;
  }

  async generateTokenPayload(user, session = {}) {
    const tokenPayload = {
      uuid: user.uuid,
    };

    return tokenPayload;
  }

  async createJWT(payload, expiration_days) {
    if (!expiration_days) {
      expiration_days = 1;
    }

    expiration_days = Math.max(Math.min(expiration_days, MAX_DURATION), MIN_DURATION);

    let passphrase = Config.get(Config.JWT_PASSPHRASE);
    let options = {
      expiresIn: `${expiration_days} days`,
      mutatePayload: true, // mutation the payload passed so we don't have to decode after to return with API call
    };

    return await new Promise((resolve, reject) => {
      JWT.sign(payload, passphrase, options, (err, jwt) => {
        if (err) {
          return reject(err);
        }
        return resolve(jwt);
      });
    });
  }

  async decodeJWT(jwt) {
    let passphrase = Config.get(Config.JWT_PASSPHRASE);
    return new Promise((resolve, reject) => {
      JWT.verify(jwt, passphrase, (err, decoded) => {
        if (err) {
          return reject(err);
        }
        return resolve(decoded);
      });
    });
  }

  setAuthCookie(response, token, expiration) {
    CookieUtil.setAuthCookie(response, token, expiration);
  }

  isUserToken(token) {
    // if it isn't a service token, it has to be a user token
    return !this.isServiceToken(token);
  }

  isServiceToken(token) {
    // TODO: Add check if token is a service token
    return false;
  }

  // express middleware to generate context for a request
  authorizeRequest(req, res, next) {
    let authorization = req.headers.authorization;
    req.context = {};
    this.authenticateRequest(authorization).then((session) => {
      session.origin = req.headers.origin;
      req.context = {
        session: session,
        req: req,
        res: res,
      };

      return next();
    }).catch((err) => {
      // TODO: This *shouldn't* happen, but if it does, we need to make sure we know, add WUPHF™ or something
      this.error(`Error determining request authorization: ${err.message}`);
      return res.status(500).send('Unable to process request');
    })
  }
}

AuthService.AUTH_LOCAL = "local";
AuthService.AUTH_GOOGLE = "google";

module.exports = AuthService;