const { AuthenticationClient, ManagementClient } = require("auth0");
const JWT = require("jsonwebtoken");
const JWKS = require('jwks-rsa');
const QueryString = require("querystring");
const ShortId = require("shortid");
const BaseOAuth = require("./base.js");
const Config = require("../config.js");

AuthenticationClient.prototype.authorizeCode = function(data) {
  return this.oauth.oauth.create({ type: "token" }, {
    grant_type: 'token',
    client_id: this.oauth.clientId,
    code: data.code,
    redirect_uri: data.redirect_uri
  });
};

class Auth0PrivateOAuth extends BaseOAuth {
  constructor(clientId, redirect, baseDomain) {
    super(...arguments);

    this.provider = "auth0";

    this.baseDomain = baseDomain;
    if (!this.baseDomain) {
      throw new Error("Auth0 OAuth requires a baseDomain");
    }

    this.client = new AuthenticationClient({
      domain: baseDomain,
      clientId: this.clientId,
    });

    this.verifier = JWKS({
      cache: true,
      jwksUri: `${this.auth0Base()}/.well-known/jwks.json`
    });
  }

  auth0Base() {
    return `https://${Config.auth0Base()}`;
  }

  generateAuthUrl(state = {}, integration = "self") {
    let params = {
      client_id: this.clientId,
      response_type: "token id_token",
      redirect_uri: this.redirectUrl,
      scope: 'openid profile email',
      audience: `astronomer-ee`,
      nonce: ShortId.generate(),
      state: this.generateState(state, integration),
    };

    if (integration && integration !== "self") {
      params.connection = integration;
    }

    return `${this.auth0Base()}/authorize?${QueryString.stringify(params)}`;
  }

  async validateToken(data) {
    const payload = JWT.decode(data.encodedJWT, {
      complete: true
    });

    if (!payload.header) {
      throw new Error("JWT invalid: no header");
    }
    if (payload.header.alg !== "RS256") {
      throw new Error("JWT invalid: invalid signing algorithm");
    }

    const kid = payload.header.kid;
    const iss = payload.payload.iss;
    const aud = payload.payload.aud;
    const exp = payload.payload.exp;

    await new Promise((resolve, reject) => {
      this.verifier.getSigningKey(kid, (err, key) => {
        if (err) {
          return reject(err);
        }
        return resolve(key.publicKey || key.rsaPublicKey);
      });
    });

    if (exp < Math.floor(new Date().getTime() / 1000)) {
      throw new Error("JWT invalid: expired");
    }

    if (iss !== `https://${this.baseDomain}/`) {
      throw new Error("JWT invalid: 'iss' mismatch");
    }

    if (aud !== this.client.oauth.clientId) {
      throw new Error("JWT invalid: 'aud' mismatch");
    }

    data.decodedJWT = payload.payload;
  }

  async getUserData(data) {
    data.providerUserId = data.decodedJWT.sub;
    data.profile.email = data.decodedJWT.email;
    data.profile.fullName = data.decodedJWT.name;
    data.profile.pictureUrl = data.decodedJWT.picture;

    return data;
  }

  normalizeExpire(expire) {
    const current = new Date();
    current.setSeconds(current.getSeconds() + (expire * 1000));
    return current.toISOString();
  }
}

module.exports = Auth0PrivateOAuth;