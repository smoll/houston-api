const BaseType = require("./base.js");

class AuthConfig extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "AuthConfig";
    this.typeDef = `
    type AuthConfig {
      localEnabled: Boolean
      googleEnabled: Boolean
      githubEnabled: Boolean
      auth0Enabled: Boolean
      googleOAuthUrl: String
      githubOAuthUrl: String
      auth0OAuthUrl: String
    }`;
  }

  resolver() {
    return {
      localEnabled(value) {
        return value.localEnabled || false;
      },
      googleEnabled(value) {
        return value.googleEnabled || false;
      },
      githubEnabled(value) {
        return value.githubEnabled || false;
      },
      auth0Enabled(value) {
        return value.auth0Enabled || false;
      },
      googleOAuthUrl(value) {
        return value.googleOAuthUrl || null;
      },
      githubOAuthUrl(value) {
        return value.githubOAuthUrl || null;
      },
      auth0OAuthUrl(value) {
        return value.auth0OAuthUrl || null;
      }
    };
  }
}

module.exports = AuthConfig;