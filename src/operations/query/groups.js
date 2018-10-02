const BaseOperation = require("../base.js");

const Constants = require("../../constants.js");

class Groups extends BaseOperation {
  constructor() {
    super();
    this.name = "groups";
    this.typeDef = `
      # Fetch groups by groupUuid or workspaceUuid
      groups(groupUuid: Uuid, entityType: String, entityUuid: Uuid) : [Group]
    `;
    this.entrypoint = "query";
    this.guards = ["authenticated",
   //   "permission:user_group_view"
    ];
  }

  async resolver(root, args, context) {
    const session = context.session;

    try {

      // get system settings
      if (args.entityType === Constants.ENTITY_SYSTEM) {
        if (!session.hasPermissions("global_group_list")) {
          return this.unauthorized("list_global_groups");
        }
        return this.service("group").fetchGroupsByEntity(Constants.ENTITY_SYSTEM);
      }

      // get a specific group uuid
      if (args.groupUuid) {
        const group = session.resources.group;
        if (group.entityType === Constants.ENTITY_SYSTEM && !session.hasPermissions("global_group_view")) {
          return this.unauthorized("view_group");
        }
        if (!session.hasPermissions([["global_group_view", "user_group_view"]])) {
          return this.unauthorized("view_group");
        }
        return [group];
      } else if (args.entityUuid) {
        // get all groups for an entity (non system)
        if (!session.hasPermissions([["global_group_list", "user_group_list"]])) {
          return this.unauthorized("list_groups");
        }

        return this.service("group").fetchGroupsByEntity(args.entityType, args.entityUuid);
      } else {
        this.generalError("A groupUuid or entityUuid is required");
      }
    } catch (err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = Groups;
