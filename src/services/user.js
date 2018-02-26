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

  async createUser(email, password) {
    try {
      let credential = await this.model("local_credential")
          .query()
          .insert({
            password: password
          }).returning("*");

      return await this.model("user")
        .query()
        .insertGraph({
          username: email,
          superAdmin: false,
          provider_id: credential.uuid,
          provider_type: this.model("user").PROVIDER_LOCAL,
          emails: [{
            address: email,
            main: true,
          }]
        }).returning("*");
    } catch (err) {
      if(err.message.indexOf("unique constraint") !== -1 && err.message.indexOf("users_username_unique") !== -1) {
        throw new Error("Email already in use by existing account");
      }
      throw err;
    }

  }

  // return false if nothing to update, user on success, throw error on failure
  async updateUser(user, payload) {
    let changes = {};

    // TODO: Do this check in a more extendable way
    if (payload["full_name"] !== undefined && payload.full_name !== user.fullName) {
      changes.fullName = payload.full_name;
    }

    if(Object.keys(changes).length === 0) {
      return false;
    }

    await user.$query().patch(changes).returning("*");
    return user;
  }

  async deleteUser(user, hard = false) {
    if (hard) {
      return await user.$query().delete();
    } else {
      return await user.$query().patch({
        deleted_at: new Date().toISOString()
      }).returning("*");
    }
  }
}

module.exports = UserService;