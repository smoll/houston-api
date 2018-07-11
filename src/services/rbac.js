const BaseService = require("./base.js");
const Context = require("../context.js");
class RbacService extends BaseService {

  async fetchPermissionsForContext(context) {
    // currently handling use case of only users (no service account) that are:
    // - just in the global user group
    // - in a workspace admin group
    // - in a workspace admin group and a deployment group
    // - no in a workspace admin group, but in a deployment group
    // - in global admin group
    if (!context.userUuid()) {
      return [];
    }

    const permissions = await this.model("permission")
      .query()
      .select("permissions.id")
      .rightJoin("role_permission_map", "role_permission_map.permission_id", "permissions.id")
      .rightJoin("group_role_map", "group_role_map.role_uuid", "role_permission_map.role_uuid")
      .rightJoin("user_group_map", "user_group_map.group_uuid", "group_role_map.group_uuid")
      .leftJoin("groups", "user_group_map.group_uuid", "groups.uuid")
      .where("user_group_map.user_uuid", context.userUuid())
      .where((qb) => {
        qb.orWhere({
          "groups.entity_uuid": null,
          "groups.entity_type": "system"
        });
        if(context.resources.workspace) {
          qb.orWhere({
            "groups.entity_uuid": context.resources.workspace.uuid,
            "groups.entity_type": "workspace"
          });
        }
        if(context.resources.deployment) {
          qb.orWhere({
            "groups.entity_uuid": context.resources.deployment.uuid,
            "groups.entity_type": "deployment"
          });
        }
      });

    if (permissions && permissions.length) {
      return permissions.map((permission) => {
        return permission.id;
      });
    }
    return [];
  }
}

module.exports = RbacService;