const BaseType = require("./base.js");

class AuthConfig extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "AuthConfig";
    this.typeDef = `
    type AuthConfig {
      localEnabled: Boolean
      googleEnabled: Boolean
      googleOAuthUrl: String
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
      googleOAuthUrl(value) {
        return value.googleOAuthUrl || null;
      }
    };
  }
}

module.exports = AuthConfig;