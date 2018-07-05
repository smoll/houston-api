const BaseService = require("./base.js");
const _ = require("lodash");

let USER_COUNT = null;

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

  async fetchUsersByWorkspaceUuid(workspaceUuid) {
    let users = await this.model("user")
      .query()
      .joinEager("emails")
      .leftJoin("user_workspace_map", "users.uuid", "user_workspace_map.user_uuid")
      .where("user_workspace_map.workspace_uuid", workspaceUuid);

    if (users && users.length > 0) {
      return users;
    }

    return null;
  }

  async fetchUserPropertiesByUser(user) {
    let properties = await user.$relatedQuery("properties");
    if (properties && properties.length > 0) {
      return properties;
    }
    return [];
  }

  async fetchUserCount() {
    if (USER_COUNT === null) {
      let result = await this.model("user")
        .query()
        .count()
        .first();
      USER_COUNT = parseInt(result.count);
    }
    return USER_COUNT;
  }

  async createUser(userData, credential) {
    try {
      const email = userData.email;
      const username = userData.username || email;
      const fullName = userData.fullName || "";
      const status = userData.status || "pending";
      const properties = [];

      // get current user count, will use later to see if user should be a system admin
      const userCount = await this.fetchUserCount();

      const AVATAR_URL = this.model("user_property").KEY_AVATAR_URL;

      if (userData.hasOwnProperty(AVATAR_URL)) {
        properties.push({
          key: AVATAR_URL,
          value: userData.avatarUrl,
          category: this.model("user_property").CATEGORY_PROFILE
        });
      }

      let user = await this.model("user")
        .query()
        .insertGraph({
          username: username,
          provider_uuid: credential.uuid,
          provider_type: credential.providerType(),
          full_name: fullName,
          status: status,
          emails: [{
            address: email,
            main: true,
          }],
          properties: properties
        }).returning("*");


      if (userCount === 0) {
        // this is the first user, lets make them a system owner
        const adminGroupKey = this.model("system_setting").KEY_ADMIN_GROUP_UUID;
        const adminGroupUuid = await this.service("system_setting").getSetting(adminGroupKey);
        const adminGroup = await this.service("group").fetchGroupByUuid(adminGroupUuid);
        await this.service("group").addUser(adminGroup, user);
      }
      return user;
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
    if (!user.properties) {
      user.properties = await this.fetchUserPropertiesByUser(user);
    }
    const properties = _.keyBy(user.properties, "key");

    let userChanges = {};
    let propChanges =  [];

    // TODO: Do this check in a more extendable way
    if (payload["fullName"] !== undefined && payload.fullName !== user.fullName) {
      userChanges.fullName = payload.fullName;
    }

    const KEY_AVATAR = this.model("user_property").KEY_AVATAR_URL;

    if (payload[KEY_AVATAR] !== undefined) {
      if (!properties[KEY_AVATAR]) {
        propChanges.push(this.model("user_property").query().insertGraphAndFetch({
          user_uuid: user.uuid,
          key: KEY_AVATAR,
          value: payload[KEY_AVATAR],
          category: this.model("user_property").CATEGORY_PROFILE
        }).then((property) => {
          user.properties.push(property);
        }));
      } else if(payload[KEY_AVATAR] !== properties[KEY_AVATAR].value) {
        // TODO: figure out updating the specific model
        propChanges.push(this.model("user_property").query().where({
          user_uuid: user.uuid,
          key: KEY_AVATAR
        }).patch({ value: payload[KEY_AVATAR] }));
      }
    }

    if(Object.keys(userChanges).length === 0 && Object.keys(propChanges).length === 0) {
      return user;
    }

    if(Object.keys(userChanges).length !== 0) {
      await user.$query().patch(userChanges).returning("*");
    }

    if(propChanges.length > 0) {
      await Promise.all(propChanges);
    }

    return user;
  }

  async deleteUser(user) {
    return await user.$query().delete();
  }
}

module.exports = UserService;