const BaseService = require("./base.js");

class PermissionService extends BaseService {

  constructor() {
    super(...arguments);
    this.permissionsById = {};
    this.permissionsByCategory= {};
    this.permissionPromise = null;
  }
  async fetchAll() {
    if (this.permissionPromise) {
      return await this.permissionPromise;
    }
    this.permissionPromise = this.model("permission").query();

    const list = await permissionPromise;

    for(let permission of list) {
      this.permissionsById[list.id] = permission;

      if (this.permissionsByCategory.hasOwnProperty(permission.category)) {
        this.permissionsByCategory[permission.category] = [];
      }
      this.permissionsByCategory[permission.category].push(permission);
    }
    return list;
  }

  async ensureFetched() {
    if (this.permissionPromise === null) {
      await this.fetchAll();
    }
  }

  async getPermissionById(id) {
    this.ensureFetched();

    if (!this.permissionsById.hasOwnProperty(id)) {
      throw Error("Unknown permission");
    }
    return this.permissionsById[id];
  }

  async getPermissionByCategory(category) {
    this.ensureFetched();

    if (!this.permissionsByCategory.hasOwnProperty(id)) {
      throw Error("Unknown permission category");
    }
    return this.permissionsByCategory[id];
  }
}

module.exports = PermissionService;