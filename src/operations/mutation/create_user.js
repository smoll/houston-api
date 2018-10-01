const Transaction = require('objection').transaction;

const BaseOperation = require("../base.js");
const Constants = require("../../constants.js");
const Errors = require("../../errors");

class CreateUser extends BaseOperation {
  constructor() {
    super();
    this.name = "createUser";
    this.typeDef = `
      # Creates a new user
      createUser(email: String!, password: String!, username: String, profile: JSON, inviteToken: String, duration: Int) : AuthUser
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      if (!args.profile) {
        args.profile = { fullName: null };
      }

      let invite = null;
      const publicSignup = await this.service("system_setting").getSetting(Constants.SYSTEM_SETTING_PUBLIC_SIGNUP);
      if (!publicSignup) {
        if (!args.inviteToken) {
          return this.inputError("Public signups are disable, a valid inviteToken is required");
        }

        invite = await this.service("invite_token").fetchInviteByToken(args.inviteToken, false);
        if (!invite) {
          throw new Error(`InviteToken not found with token "${inviteToken}"`);
        }
        if (invite.email !== args.email) {
          return this.inputError("The email specified is not associated with the specified invite token");
        }
      }

      // ensure profile is an object
      const profile = Object.assign({}, args.profile);

      return await Transaction(this.conn("postgres"), async (trx) => {
        const options = {
          transaction: trx
        };
        let user = await this.service("local_user").createUser(args.email, args.password, args.username, profile, options);

        if (invite) {
          if (invite.workspaceUuid) {
            await this.service("workspace").addUserByWorkspaceUuid(invite.workspaceUuid, user, options);
          }
          await this.service("invite_token").deleteInviteToken(invite, options);
        }

        let tokenInfo = null;
        if (user.isActive()) {
          let tokenPayload = await this.service("auth").generateTokenPayload(user);
          let token = await this.service("auth").createJWT(tokenPayload, args.duration);

          this.service("auth").setAuthCookie(context.res, token, tokenPayload.exp);

          tokenInfo = {
            value: token,
            payload: tokenPayload
          };
        }

        return {
          user: user,
          token: tokenInfo,

          // TODO Do a rbac lookup for the user
          permissions: {},
          isAdmin: false,
        }
      });
    } catch (err) {
      this.error(err.message);
      throw err
    }
  }
}

module.exports = CreateUser;
