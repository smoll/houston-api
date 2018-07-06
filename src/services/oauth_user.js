const BaseService = require("./base.js");

class OauthUserService extends BaseService {

  async authenticateUser(data) {

    // TODO: Objection failing to populate data when selecting by email and credentials or just creds alone.
    // Doing the working but unoptimized alternative.. figure out what is wrong with doing it the right way.
    let user = await this.service("user").fetchUserByEmail(data.profile.email, false);
    let credential = await this.fetchCredentials(data.providerType, data.providerUserId);

    if (!user && credential) {
      user = await this.service("user").fetchUserByUuid(credential.user_uuid, false)
    }

    if (credential) {
      user.oauthCredentials = [credential];
    }

    const userData = {
      status: "active",
      email: data.profile.email,
      emailVerified: true,
      username: data.profile.email,
      fullName: data.profile.fullName,
      avatarUrl: data.profile.pictureUrl
    };

    if (user) {
      if (!user.oauthCredentials || user.oauthCredentials.length === 0) {
        await this.createOAuthCredential(user, data);
      }
      return await this.service("user").updateUser(user, userData);
    }

    // oauth user doesn't exist, but has already been authenticated. Create it!
    return await this.createUser(data, userData);
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

  async createUser(OAuthData, userData) {
    const user = await this.service("user").createUser(userData);

    if (!user.oauthCredentials) {
      user.oauthCredentials = [];
    }
    user.oauthCredentials = [await this.createOAuthCredential(user, OAuthData)];
    return user;
  }

  async createOAuthCredential(user, OAuthData) {
    user.oauthCredentials.push(await this.model("oauth_credential")
      .query()
      .insert({
        oauth_provider: OAuthData.providerType,
        oauth_user_id: OAuthData.providerUserId,
        user_uuid: user.uuid,
        refresh_token: OAuthData.refreshToken,
        access_token: OAuthData.accessToken,
        expires_at: new Date(OAuthData.expires).toISOString()
      }).returning("*"));

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