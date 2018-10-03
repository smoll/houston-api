const BaseService = require("./base.js");

const Errors = require("../errors/index.js");
class LocalUserService extends BaseService {

  async fetchCredentialsForUser(user) {
    let credentials = await this.model("local_credential")
      .query()
      .findById(user.uuid);
    if (credentials) {
      return credentials;
    }
    return null;
  }

  async fetchCredentialByResetToken(resetToken) {
    let credentials = await this.model("local_credential")
      .query()
      .findOne({
        resetToken: resetToken
      });

    if (credentials) {
      return credentials;
    }
    return null;
  }

  async authenticateUser(emailOrUsername, password) {
    let user = await this.service("user").fetchUserByEmail(emailOrUsername, false);
    if (!user) {
      user = await this.service("user").fetchUserByUsername(emailOrUsername, false);
    }

    if (!user) {
      this.resourceNotFound("user", emailOrUsername);
    }

    let credentials = await this.fetchCredentialsForUser(user);

    if (!credentials) {
      throw new Error("No password credentials found for this user, did you mean to sign in with OAuth?");
    }

    if (!await credentials.verifyPassword(password)) {
      throw new Errors.AuthError("Invalid password specified");
    }
    return user
  }

  async createUser(email, password, username, userData = {}, options = {}) {
    userData.email = email;
    userData.username = username;

    const user = await this.service("user").createUser(userData, options);

    await this.model("local_credential")
      .query(options.transaction)
      .insert({
        user_uuid: user.uuid,
        password: password
      }).returning("*");

    return user;
  }

  async updatePassword(credentials, password, options = {}) {
    return await credentials
      .$query(options.transaction)
      .patch({
        password: password,
        resetToken: null,
      });
  }
}

module.exports = LocalUserService;
