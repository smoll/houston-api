const Google = require("googleapis").google;
const JWT = require("jsonwebtoken");

const BaseOAuth = require("./base.js");

class GoogleOAuth extends BaseOAuth {
  constructor() {
    super(...arguments);

    this.client = this.newClient();
  }

  newClient() {
    return new Google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUrl
    );
  }

  generateAuthUrl(state = "") {
    const scopes = [
      'profile',
      'email'
    ];

    return this.client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      include_granted_scopes: true,
      response_type: "code",
      scope: scopes,
      state: state
    });
  }

  async exchangeToken(code, data) {
    const response = await this.client.getToken(code);

    data.accessToken = response.tokens.access_token;
    data.refreshToken = response.tokens.refresh_token;
    data.expires = response.tokens.expiry_date;
    data.jwtPayload = response.tokens.id_token;
  }

  async getUserData(data) {
    // TODO: Verify using matching token from https://www.googleapis.com/oauth2/v3/certs
    const decoded = JWT.decode(data.jwtPayload);

    data.providerUserId = decoded.sub;
    data.profile.email = decoded.email;
    data.profile.firstName = decoded.given_name;
    data.profile.lastName = decoded.family_name;
    data.profile.fullName = decoded.name;
    data.profile.pictureUrl = decoded.picture;

    return data;
  }
}

module.exports = GoogleOAuth;