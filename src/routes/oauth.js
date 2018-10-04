const QueryString = require("querystring");

const BaseRoute = require("./base.js");
const Constants = require("../constants.js");
const Config = require("../utils/config.js");

const Transaction = require('objection').transaction;

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
      const expiration = body.expires_in;
      const state = JSON.parse(decodeURIComponent(body.state));
      const strategy = `${state.provider}_oauth`;

      const data = await this.service("auth").authenticateOAuth(strategy, idToken, expiration);

      let user = await this.service("user").fetchUserByEmail(data.profile.email, {
        throwError: false
      });

      if (!user) {
        let invite = null;
        const firstSignup = await this.service("user").fetchUserCount() === 0;
        const publicSignup = await this.service("system_setting").getSetting(Constants.SYSTEM_SETTING_PUBLIC_SIGNUP);
        if (!firstSignup && !publicSignup) {
          const inviteToken = state.inviteToken;
          if (!inviteToken) {
            throw new Error("You are not authorized to login, please contact the platform owner to request an invitation.");
          }

          invite = await this.service("invite_token").fetchInviteByToken(inviteToken, false);
          if (!invite) {
            throw new Error(`No valid invitation found with the token "${inviteToken}"`);
          }
          if (invite.email !== data.profile.email) {
            throw new Error("This invitation does not match the authenticated email address");
          }
        }

        user = await Transaction(this.conn("postgres"), async (trx) => {
          const options = {
            transaction: trx
          };
          return await this.service("oauth_user").authenticateUser(data, invite, options);
        });
      }

      let tokenPayload = await this.service("auth").generateTokenPayload(user);
      let token = await this.service("auth").createJWT(tokenPayload, state.duration);

      this.service("auth").setAuthCookie(res, token, tokenPayload.exp);

      if (state.redirect.length && state.redirect[0] === "/") {
        state.redirect = state.redirect.substr(1);
      }

      if (state.redirect.substr(0, 4) !== "http") {
        state.redirect = `${Config.orbitDomain(true)}/${state.redirect}`;
      }

      const params = {
        extras: JSON.stringify(state.extras),
        strategy: state.strategy.replace("_oauth", ""),
        token: token,
      };

      const url = `${state.redirect}?${QueryString.stringify(params)}`;

      return res.redirect(url);
    } catch (err) {
      this.application.output("Failed to finalize OAuth flow");
      this.application.output(err);
      return res.redirect(`${Config.orbitDomain(true)}/error?error=${encodeURIComponent(err.message)}`);
    }
  }

  redirect(location) {

  }
}

module.exports = AuthorizationRoute;