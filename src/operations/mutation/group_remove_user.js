const BaseOperation = require("../base.js");

const Constants = require("../../constants.js");

class GroupAddUser extends BaseOperation {
  constructor() {
    super();
    this.name = "groupRemoveUser";
    this.typeDef = `
      # Remove user from a group
      groupRemoveUser(groupUuid: Uuid, userUuid: Uuid) : Group
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      let user = await this.service("user").fetchUserByUuid(args.userUuid);
      let group = await this.service("group").fetchGroupByUuid(args.groupUuid);

      if (group.entity_type === Constants.ENTITY_SYSTEM) {
        if (!context.session.hasPermissions("global_group_user_remove")) {
          return this.unauthorized("remove_global_user");
        }
      } else {
        if (!context.session.hasPermissions([["global_group_user_remove", "user_group_user_remove"]])) {
          return this.unauthorized("remove_global_user");
        }
      }

      await this.service("group").removeUser(group, user);
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
