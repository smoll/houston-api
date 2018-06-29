const BaseService = require("./base.js");


class LocalUserService extends BaseService {

  async authenticateUser(emailOrUsername, password) {
    let user = await this.service("user").fetchUserByUsername(emailOrUsername, false);
    if (!user) {
      user = await this.service("user").fetchUserByEmail(emailOrUsername, false);
    }

    if (!user) {
      this.notFound("user", emailOrUsername);
    }

    let credentials = await this.fetchCredentialsForUser(user);
    if (!await credentials.verifyPassword(password)) {
      throw new Error("User password incorrect");
    }
    return user
  }

  async createUser(email, password, username, fullName) {
    let credential = await this.model("local_credential")
      .query()
      .insert({
        password: password
      }).returning("*");

    const userData = {
      email: email,
      username: username,
      fullName: fullName,
    };

    return this.service("user").createUser(userData, credential);
  }

  async fetchCredentialsForUser(user) {
    let credentials = this.model("local_credential")
        .query()
        .findById(user.providerUuid);
    if (credentials) {
      return credentials;
    }
    return null;
  }
}

module.exports = LocalUserService;