const BaseService = require("./base.js");

class UserService extends BaseService {

  async fetchUserByEmail(email, throwError = true) {
    let user = await this.model("user")
        .query()
        .joinEager("emails")
        .findOne("emails.address", email);

    if (user) {
      return user;
    }
    if (throwError) {
      this.notFound("user", email);
    }
    return null;
  }

  async fetchUserByUsername(username, throwError = true) {
    let user = await this.model("user")
        .query()
        .joinEager("emails")
        .findOne("username", username);

    if (user) {
      return user;
    }
    if (throwError) {
      this.notFound("user", username);
    }

    return null;
  }

  async fetchUserByUuid(uuid, throwError = true) {
    let user = await this.model("user")
        .query()
        .joinEager("emails")
        .findById(uuid);

    if (user) {
      return user;
    }
    if (throwError) {
      this.notFound("user", uuid);
    }

    return null;
  }

  async fetchUsersByTeamUuid(teamUuid) {
    let users = await this.model("user")
      .query()
      .joinEager("emails")
      .leftJoin("user_team_map", "users.uuid", "user_team_map.user_uuid")
      .where("user_team_map.team_uuid", teamUuid);

    if (users && users.length > 0) {
      return users;
    }

    return null;
  }

  async createUser(userData, credential) {
    try {
      const email = userData.email;
      const username = userData.username || email;
      const fullName = userData.fullName || "";
      const properties = [];

      // Needs relation added to model
      // if (userData.hasOwnProperty("pictureUrl")) {
      //   properties.push({
      //     key: this.model("user_property").KEY_PICTURE_URL,
      //     value: userData.pictureUrl,
      //     category: this.model("user_property").CATEGORY_PROFILE
      //   });
      // }

      return await this.model("user")
        .query()
        .insertGraph({
          username: username,
          provider_uuid: credential.uuid,
          provider_type: credential.providerType(),
          full_name: fullName,
          emails: [{
            address: email,
            main: true,
          }],
          //properties: properties
        }).returning("*");
    } catch (err) {
      // TODO: Verify errors
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

  async deleteUser(user) {
    return await user.$query().delete();
  }
}

module.exports = UserService;