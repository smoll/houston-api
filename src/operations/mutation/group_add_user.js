const BaseOperation = require("../base.js");

class GroupAddUser extends BaseOperation {
  constructor() {
    super();
    this.name = "groupAddUser";
    this.typeDef = `
      # Add user to a group
      groupAddUser(groupUuid: Uuid, email: String) : Group
    `;
    this.entrypoint = "mutation";
    this.guards = ["authenticated"];
  }

  async resolver(root, args, context) {
    try {
      let user = await this.service("user").fetchUserByEmail(args.email);

      let group = await this.service("group").fetchGroupByUuid(args.groupUuid);

      if (group.entity_uuid === null && !context.hasPermission("global_group_user_add")) {
        this.unauthorized("add_global_user");
      }

      const result = await this.service("group").addUser(group, user);
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
