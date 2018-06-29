const BaseService = require("./base.js");

class OauthUserService extends BaseService {

  async authenticateUser(data) {
    let user = await this.fetchUserByOAuthCredential(data);

    if (user) {
      return user;
    }

    // oauth user doesn't exist, but has already been authenticated. Create it!
    return await this.createUser(data);
  }

  async createUser(OAuthData) {
    let credential = await this.model("oauth_credential")
      .query()
      .insert({
        oauth_provider: OAuthData.providerType,
        oauth_user_id: OAuthData.providerUserId,
        refresh_token: OAuthData.refreshToken,
        access_token: OAuthData.accessToken,
        expires_at: new Date(OAuthData.expires).toISOString()
      }).returning("*");

    const userData = {
      email: OAuthData.profile.email,
      username: OAuthData.profile.email,
      fullName: OAuthData.profile.fullName,
      profileUrl: OAuthData.profile.pictureUrl
    };

    return this.service("user").createUser(
      userData,
      credential
    );
  }

  async fetchUserByOAuthCredential(data) {
    const providerType = this.model('oauth_credential').PROVIDER_TYPE;

    let user = this.model("user")
      .query()
      .leftJoin("oauth_credentials",'users.provider_uuid', 'oauth_credentials.uuid')
      .where('users.provider_type', providerType)
      .where("oauth_credentials.oauth_provider", data.providerType)
      .where("oauth_credentials.oauth_user_id", data.providerUserId)
      .first();

    if (user) {
      return user;
    }
    return null;
  }
}

module.exports = OauthUserService;