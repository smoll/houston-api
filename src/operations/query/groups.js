const BaseOperation = require("../base.js");

class Groups extends BaseOperation {
  constructor() {
    super();
    this.name = "groups";
    this.typeDef = `
      # Fetch groups by groupUuid or teamUuid
      groups(groupUuid: Uuid, teamUuid: Uuid) : [Group]
    `;
    this.entrypoint = "query";
  }

  async resolver(root, args, context) {
    try {
      let groups;
      if (args.groupUuid) {
        groups = [this.service("group").fetchGroupByUuid(args.groupUuid, {
          relations: "[users.emails]",
        })];
      } else if (args.teamUuid) {
        groups = this.service("group").fetchGroupsByTeamUuid(args.teamUuid, {
          relations: "[users.emails]",
        });
      } else {
        throw new Error("A groupUuid or teamUuid is required");
      }
      return groups;
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = Groups;
