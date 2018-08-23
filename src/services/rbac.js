const BaseService = require("./base.js");
class RbacService extends BaseService {

  async fetchPermissionsForSession(session) {
    // currently handling use case of only users (no service account) that are:
    // - just in the global user group
    // - in a workspace admin group
    // - in a workspace admin group and a deployment group
    // - no in a workspace admin group, but in a deployment group
    // - in global admin group
    if (!session.userUuid()) {
      return [];
    }

    // Set Workspace to Deployment Workspace if Session has No Workspace
    if (session.resources.deployment && !session.resources.workspace && session.resources.deployment.workspace) {
      session.resources.workspace = session.resources.deployment.workspace;
    }

    const permissions = await this.model("permission")
      .query()
      .select("permissions.id")
      .rightJoin("role_permission_map", "role_permission_map.permission_id", "permissions.id")
      .rightJoin("group_role_map", "group_role_map.role_uuid", "role_permission_map.role_uuid")
      .rightJoin("user_group_map", "user_group_map.group_uuid", "group_role_map.group_uuid")
      .leftJoin("groups", "user_group_map.group_uuid", "groups.uuid")
      .where("user_group_map.user_uuid", session.userUuid())
      .where((qb) => {
        qb.orWhere({
          "groups.entity_uuid": null,
          "groups.entity_type": "system"
        });
        if(session.resources.workspace) {
          qb.orWhere({
            "groups.entity_uuid": session.resources.workspace.uuid,
            "groups.entity_type": "workspace"
          });
        }
        if(session.resources.deployment && session.resources.deployment.workspace_uuid === session.resources.workspace.uuid) {
          qb.orWhere({
            "groups.entity_uuid": session.resources.deployment.uuid,
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
