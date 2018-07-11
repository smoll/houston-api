const BaseService = require("./base.js");

class CommonService extends BaseService {

  async healthcheckPostgres() {
    let { rows } = await this.conn("postgres").raw('SELECT version() as check');
    return rows.length === 1;
  }

  async resourceResolver(resources) {
    const results = {};
    const promises = [];
    for(let resourceKey in resources) {
      if (!resources.hasOwnProperty(resourceKey)) {
        continue;
      }

      const promise = this.resolveResource(resourceKey, resources[resourceKey]).then((result) => {
        results[resourceKey.replace("Uuid", "")] = result;
      });

      promises.push(promise);
    }

    return Promise.all(promises).then(() => {
      return results;
    });
  }

  async resolveResource(resourceType, resourceUuid) {
    switch(resourceType) {
      case "deploymentUuid":
        return this.service("deployment").fetchDeploymentByUuid(resourceUuid);
      case "groupUuid":
        return this.service("group").fetchGroupByUuid(resourceUuid);
      case "inviteUuid":
        return this.service("invite_token").fetchInviteByUuid(resourceUuid);
      case "serviceAccountUuid":
        return this.service("service_account").fetchServiceAccountByUuid(resourceUuid);
      case "workspaceUuid":
        return this.service("workspace").fetchWorkspaceByUuid(resourceUuid);
      case "userUuid":
        return this.service("user").fetchUserByUuid(resourceUuid);
    }
  }

  async resolveRequesterPermissions(context) {
    const permissions = await this.service("rbac").fetchPermissionsForContext(context);
    if (permissions.length > 0) {
      for(let permission of permissions) {
        context.permissions[permission] = true;
      }
    }
  }
}

module.exports = CommonService;