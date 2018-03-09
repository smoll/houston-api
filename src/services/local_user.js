const BaseService = require("./base.js");

const LocalStrategy = require("passport-local");

class LocalUserService extends BaseService {

  getAuthStrategy() {
    return new LocalStrategy({
      session: false,
    }, async (username, password, done) => {
      try {
        let user = await this.authenticateUser(username, password);
        if (user === false) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    });
  }

  async authenticateUser(emailOrUsername, password) {
    let user = await this.service("user").fetchUserByUsername(emailOrUsername);
    if (!user) {
      user = await this.service("user").fetchUserByEmail(emailOrUsername);
    }

    if (!user) {
      throw new Error("User not found");
    }

    let credentials = await this.fetchCredentialsForUser(user);
    if (!await credentials.verifyPassword(password)) {
      throw new Error("User password incorrect");
    }
    return user
  }

  async fetchCredentialsForUser(user) {
    let credentials = this.model("local_credential")
        .query()
        .findById(user.providerId);
    if (credentials) {
      return credentials;
    }
    return null;
  }
}

module.exports = LocalUserService;