const BaseService = require("./base.js");

class RbacService extends BaseService {

  // Permissions assigned at the global group, workspace group, or service account level

  transformGroupPermissions(groups) {
    // for each group, translate the permissions to a flattened list, and for each permission
    // determine if it was granted by a global group or workspace group
  }

  transformAllRolePermissions(roles) {

  }

  transformRolePermissions(role) {
    // return object containing a key value, with the key being the permission and value being the object below with the appropriate flags toggled
    /*
    {
      global: true/false,
      workspace: true/false,
      service: true/false
     */
  }

  async getPermission() {
    return await this.model("role").query(options.transaction || undefined).insertGraph({
      label: label,
      category: category,
      entity_type: entity_type,
      entity_uuid: entity_uuid
    }).returning("*");
  }

  async createMany(rolePayloads, options = {}) {
    // TODO: Add label and description validation
    return await this.model("role").query(options.transaction || undefined).insertGraph(rolePayloads).returning("*");
  }
}

module.exports = RbacService;