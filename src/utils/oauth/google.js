const Google = require("googleapis").google;
const { OAuth2Client } = require('google-auth-library');
const ShortId = require("shortid");

const BaseOAuth = require("./base.js");

class GoogleOAuth extends BaseOAuth {
  constructor() {
    super(...arguments);

    this.provider = "google";

    this.client = new Google.auth.OAuth2(
      this.clientId,
      null,
      this.redirectUrl
    );
    this.verifier = new OAuth2Client(this.clientId);
  }

  generateAuthUrl(state = {}) {
    return this.client.generateAuthUrl({
      include_granted_scopes: true,
      response_type: "token id_token",
      scope: [
        'profile',
        'email'
      ],
      nonce: ShortId.generate(),
      state: this.generateState(state),
    });
  }

  async validateToken(data) {
    const ticket = await this.verifier.verifyIdToken({
      idToken: data.encodedJWT,
      audience: this.clientId,
    });

    data.decodedJWT = ticket.getPayload();

    if (data.decodedJWT.exp < Math.floor(new Date().getTime() / 1000)) {
      throw new Error("JWT invalid: expired");
    }

    if (data.decodedJWT.iss !== `https://accounts.google.com`) {
      throw new Error("JWT invalid: 'iss' mismatch");
    }

    if (data.decodedJWT.aud !== this.clientId) {
      throw new Error("JWT invalid: 'aud' mismatch");
    }
  }

  async getUserData(data) {
    data.providerUserId = data.decodedJWT.sub;
    data.profile.email = data.decodedJWT.email;
    data.profile.fullName = data.decodedJWT.name;
    data.profile.pictureUrl = data.decodedJWT.picture;

    return data;
  }
}

module.exports = GoogleOAuth;