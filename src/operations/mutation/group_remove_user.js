const BaseOperation = require("../base.js");

class GroupAddUser extends BaseOperation {
  constructor() {
    super();
    this.name = "groupRemoveUser";
    this.typeDef = `
      # Remove user from a group
      groupRemoveUser(groupUuid: Uuid, userUuid: Uuid) : Group
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated", "permission:user_group_user_remove"];
  }

  async resolver(root, args, context) {
    try {
      let user = await this.service("user").fetchUserByUuid(args.userUuid);
      let group = await this.service("group").fetchGroupByUuid(args.groupUuid);

      if (group.workspace_uuid === null && !context.session.hasPermission("global_group_user_add")) {
        this.unauthorized("add_global_user");
      }

      const result = await this.service("group").removeUser(group, user);
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
