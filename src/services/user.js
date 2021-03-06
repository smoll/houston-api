const BaseService = require("./base.js");
const _ = require("lodash");
const ShortId = require("shortid");
const Transaction = require('objection').transaction;

let USER_COUNT = null;

class UserService extends BaseService {

  async fetchUserByEmail(email, options = { throwError: true }) {
    let user = await this.model("user")
        .query()
        .joinEager("emails")
        .findOne("emails.address", email);

    if (user) {
      return user;
    }

    if (options.throwError) {
      this.resourceNotFound("user", email);
    }
    return null;
  }

  async fetchUserByUsername(username, options = { throwError: true }) {
    let user = await this.model("user")
        .query()
        .joinEager("emails")
        .findOne("username", username);

    if (user) {
      return user;
    }
    if (options.throwError) {
      this.resourceNotFound("user", username);
    }

    return null;
  }

  async fetchUserByUuid(uuid, options = { throwError: true }) {
    let user = await this.model("user")
        .query()
        .joinEager("emails")
        .findById(uuid);

    if (user) {
      return user;
    }

    if (options.throwError) {
      this.resourceNotFound("user", uuid);
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

    return [];
  }

  async fetchUserPropertiesByUser(user) {
    let properties = await user.$relatedQuery("properties");
    if (properties && properties.length > 0) {
      return properties;
    }
    return [];
  }

  async fetchUsersByGroupUuid(groupUuid) {
    let users = await this.model("user")
      .query()
      .joinEager("emails")
      .leftJoin("user_group_map", "users.uuid", "user_group_map.user_uuid")
      .where("user_group_map.group_uuid", groupUuid);

    if (users && users.length > 0) {
      return users;
    }

    return null;

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

  async createUser(userData, options = {}) {
    try {
      const emailConfirmEnabled = await this.service("common").emailConfirmationEnabled();

      const email = userData.email;
      const username = userData.username || email;
      const fullName = userData.fullName || "";
      const status = userData.status || await this.determineDefaultStatus(emailConfirmEnabled);
      const emailVerified = userData.emailVerified || !emailConfirmEnabled;
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

      const emailToken = ShortId.generate();

      let user = await this.model("user")
        .query(options.transaction)
        .insertGraph({
          username: username,
          full_name: fullName,
          status: status,
          emails: [{
            address: email,
            main: true,
            verified: emailVerified,
            token: emailToken,
          }],
          properties: properties
        }).returning("*");

      if (!emailVerified) {
        await this.service("mailer").sendConfirmation(email, emailToken);
      }

      if (userCount === 0) {
        // this is the first user, lets make them a system owner
        const adminGroupKey = this.model("system_setting").KEY_ADMIN_GROUP_UUID;
        const adminGroupUuid = await this.service("system_setting").getSetting(adminGroupKey);
        const adminGroup = await this.service("group").fetchGroupByUuid(adminGroupUuid);
        await this.service("group").addUser(adminGroup, user, options);
        USER_COUNT = null;
      }


      // Add all users to the system level users group
      const usersGroupKey = this.model("system_setting").KEY_USERS_GROUP_UUID;
      const usersGroupUuid = await this.service("system_setting").getSetting(usersGroupKey);
      const usersGroup = await this.service("group").fetchGroupByUuid(usersGroupUuid);
      await this.service("group").addUser(usersGroup, user, options);

      // create default workspace for user
      let workspaceLabel = "Default Workspace";
      if (user.fullName) {
        workspaceLabel = `${user.fullName}'s Workspace`;
      } else if (user.username) {
        workspaceLabel = `${user.username}'s Workspace`;
      }

      let workspaceDesc = "Default Workspace";
      if (user.fullName) {
        workspaceDesc = `Default workspace for ${user.fullName}`
      } else if (user.email) {
        workspaceDesc = `Default workspace for ${user.email}`
      } else if (user.username) {
        workspaceDesc = `Default workspace for ${user.username}`
      }

      await this.service("workspace").createWorkspaceWithDefaultGroups(user, {
        label: workspaceLabel,
        description: workspaceDesc
      }, options);

      return user;
    } catch (err) {
      // TODO: Verify errors
      if(err.message.indexOf("unique constraint") !== -1) {
        throw new Error("Email already in use by existing account");
      }
      throw err;
    }

  }

  // return false if nothing to update, user on success, throw error on failure
  async updateUser(user, payload, options = {}) {
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
      await user
        .$query()
        .patch(userChanges)
        .returning("*");
    }

    if(propChanges.length > 0) {
      await Promise.all(propChanges);
    }

    return user;
  }

  async markActive(user) {
    return await user.$query().patch({
      status: this.model("user").STATUS_ACTIVE,
    }).returning("*");
  }

  async deleteUser(user) {
    return await user.$query().delete();
  }

  async forgotPassword(email, user) {
    let credentials = await this.service("local_user").fetchCredentialsForUser(user);

    if (!credentials) {
      throw new Error("No password credentials found for this user, did you mean to sign in with OAuth?");
    }

    return await Transaction(this.conn("postgres"), async (trx) => {
      await credentials.$query(trx).patch({
        resetToken: credentials.generateShortId()
      }).returning("*");

      await this.service("mailer").sendPasswordReset(email, user, credentials.resetToken);
      return true;
    });
  }

  async determineDefaultStatus(confirmEnabled) {
    if (confirmEnabled === undefined) {
      confirmEnabled = await this.service("common").emailConfirmationEnabled();
    }
    if (confirmEnabled) {
      return this.model("user").STATUS_PENDING;
    }
    return this.model("user").STATUS_ACTIVE;
  }
}

module.exports = UserService;
