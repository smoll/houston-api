const QueryString = require("querystring");

const BaseRoute = require("./base.js");
const Config = require("../utils/config.js");

class AuthorizationRoute extends BaseRoute {
  route() {
    return "oauth";
  }

  method() {
    return ["post"];
  }

  async action(req, res) {
    try {
      const body = req.body;

      const idToken = body.id_token;
      const accessToken = body.access_token;
      const expiration = body.expires_in;
      const state = JSON.parse(decodeURIComponent(body.state));
      const strategy = `${state.provider}_oauth`;

      const user = await this.service("auth").authenticateOAuth(strategy, idToken, accessToken, expiration);

      let tokenPayload = await this.service("auth").generateTokenPayload(user);
      let token = await this.service("auth").createJWT(tokenPayload, state.duration);

      this.service("auth").setAuthCookie(res, token, tokenPayload.exp);

      if (state.redirect.length && state.redirect[0] === "/") {
        state.redirect = state.redirect.substr(1);
      }

      if (state.redirect.substr(0, 4) !== "http") {
        state.redirect = `${Config.orbitDomain()}/${state.redirect}`;
      }

      const params = {
        source: state.source,
        token: token,
      };

      const url = `${state.redirect}?${QueryString.stringify(params)}`;

      return res.redirect(url);
    } catch (err) {
      this.application.output("Failed to finalize OAuth flow");
      this.application.output(err);
    }
  }

  redirect(location) {

  }
}

module.exports = AuthorizationRoute;