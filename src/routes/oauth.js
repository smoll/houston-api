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

      let invite = null;
      const firstSignup = await this.service("user").fetchUserCount() === 0;
      const publicSignup = await this.service("system_setting").getSetting(Constants.SYSTEM_SETTING_PUBLIC_SIGNUP);
      if (!firstSignup && !publicSignup) {
        const inviteToken = state.inviteToken;
        if (!inviteToken) {
          throw new Error("Public signups are disable, a valid inviteToken is required");
        }

        invite = await this.service("invite_token").fetchInviteByToken(inviteToken, false);
        if (!invite) {
          throw new Error(`InviteToken not found with token "${inviteToken}"`);
        }
        if (invite.email !== data.profile.email) {
          throw new Error("The email specified is not associated with the specified invite token");
        }
      }

      const user = await Transaction(this.conn("postgres"), async (trx) => {
        const options = {
          transaction: trx
        };
        const user = await this.service("oauth_user").authenticateUser(data, invite, options);

        if (invite) {
          if (invite.workspaceUuid) {
            await this.service("workspace").addUserByWorkspaceUuid(invite.workspaceUuid, user, options);
          }
          await this.service("invite_token").deleteInviteToken(invite, options);
        }
        return user;
      });

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
      return res.status(500).end(`An error occurred while finalizing your login\n\n${err}`);
    }
  }

  redirect(location) {

  }
}

module.exports = AuthorizationRoute;