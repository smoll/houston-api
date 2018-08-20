const BaseOperation = require("../base.js");

const Constants = require("../../constants.js");

class GroupAddUser extends BaseOperation {
  constructor() {
    super();
    this.name = "groupAddUser";
    this.typeDef = `
      # Add user to a group
      groupAddUser(groupUuid: Uuid, userUuid: String) : Group
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      const user = context.session.resources.user;
      const group = context.session.resources.group;

      if (group.entity_type === Constants.ENTITY_SYSTEM) {
        if (!context.session.hasPermissions("global_group_user_add")) {
          return this.unauthorized("add_global_user");
        }
      } else {
        if (!context.session.hasPermissions([["global_group_user_add", "user_group_user_add"]])) {
          return this.unauthorized("add_global_user");
        }
      }

      await this.service("group").addUser(group, user);
      return await this.service("group").fetchGroupByUuid(group.uuid, {
        relations: "[users.emails]",
      });
    } catch (err) {
      this.error(err);
      throw err;
    }
  }
}

module.exports = GroupAddUser;
