const BaseService = require("./base.js");

class OauthUserService extends BaseService {

  async authenticateUser(data, invite, options = {}) {

    // TODO: Objection failing to populate data when selecting by email and credentials or just creds alone.
    // Doing the working but unoptimized alternative.. figure out what is wrong with doing it the right way.
    let user = await this.service("user").fetchUserByEmail(data.profile.email, false);
    let credential = await this.fetchCredentials(data.providerType, data.providerUserId);

    if (!user && credential) {
      user = await this.service("user").fetchUserByUuid(credential.userUuid, false)
    }

    if (credential) {
      user.oauthCredentials = [credential];
    }

    const userData = {
      status: this.model("user").STATUS_ACTIVE,
      email: data.profile.email,
      emailVerified: true,
      username: data.profile.email,
      fullName: data.profile.fullName,
      avatarUrl: data.profile.pictureUrl
    };

    if (user) {
      if (!user.oauthCredentials || user.oauthCredentials.length === 0) {
        user.oauthCredentials = [await this.createOAuthCredential(user, data)];
      }
      return await this.service("user").updateUser(user, userData, options);
    }

    // oauth user doesn't exist, but has already been authenticated. Create it!
    user = await this.createUser(data, userData, options);

    if (invite) {
      if (invite.workspaceUuid) {
        await this.service("workspace").addUserByWorkspaceUuid(invite.workspaceUuid, user, options);
      }
      await this.service("invite_token").deleteInviteToken(invite, options);
    }

    return user;
  }

  async fetchCredentials(providerType, providerUserId) {
    let credential = await this.model("oauth_credential")
      .query()
      .where("oauth_credentials.oauth_provider", providerType)
      .where("oauth_credentials.oauth_user_id", providerUserId)
      .first();

    if (credential) {
      return credential;
    }
    return null;
  }

  async createUser(OAuthData, userData, options = {}) {
    const user = await this.service("user").createUser(userData, options);

    if (!user.oauthCredentials) {
      user.oauthCredentials = [];
    }
    user.oauthCredentials = [await this.createOAuthCredential(user, OAuthData, options)];
    return user;
  }

  async createOAuthCredential(user, OAuthData, options = {}) {
    return await this.model("oauth_credential")
      .query(options.transaction)
      .insert({
        oauth_provider: OAuthData.providerType,
        oauth_user_id: OAuthData.providerUserId,
        user_uuid: user.uuid,
        expires_at: new Date(OAuthData.expires).toISOString()
      }).returning("*");
  }

  async fetchUserByOAuthData(data) {
    let user = await this.model("user")
      .query()
      .joinEager("[emails, oauthCredentials]")
      .where((qb) => {
        qb
          .where("oauth_credentials.oauth_provider", data.providerType)
          .where("oauth_credentials.oauth_user_id", data.providerUserId)
      })
      .orWhere("emails.address", data.profile.email)
      .first();

    if (user) {
      return user;
    }
    return null;
  }
}

module.exports = OauthUserService;