const { BaseService } = require("@moilandtoil/sealab-application");
class UserService extends BaseService {

  async fetchUserByEmail(email) {
    let user = await this.model("user")
        .query()
        .joinEager("emails")
        .whereNull("users.deleted_at")
        .findOne("emails.address", email);

    if (user) {
      return user;
    }
    console.log(user);
    return null;
  }

  async fetchUserByUsername(username) {
    let user = await this.model("user")
        .query()
        .joinEager("emails")
        .whereNull("users.deleted_at")
        .findOne("username", username);
    if (user) {
      return user;
    }
    return null;
  }

  async fetchUserByUuid(uuid) {
    let user = await this.model("user")
        .query()
        .joinEager("emails")
        .whereNull("users.deleted_at")
        .findById(uuid);
    if (user) {
      return user;
    }
    return null;
  }

  async createUser(username, email, password) {
    return await this.model("user")
        .query()
        .insertGraph({
          username: username,
          password: password,
          superAdmin: false,
          emails: [{
            address: email,
            main: true,
          }]
        }).returning('*');
  }

  async updateUser(user, payload) {
    await user.$query().patch(payload).return("*");
    return user;
  }

  async deleteUser(user, hard = false) {
    if (hard) {
      return await user.$query().delete();
    } else {
      return await user.$query().patch({
        deleted_at: new Date().toISOString()
      }).return("*");
    }
  }
}

module.exports = UserService;