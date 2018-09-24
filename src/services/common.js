const BaseService = require("./base.js");

const Config = require("../utils/config.js");
const Constants = require("../constants.js");
class CommonService extends BaseService {

  async healthcheckPostgres() {
    let { rows } = await this.conn("postgres").raw('SELECT version() as check');
    return rows.length === 1;
  }

  async resourceResolver(args) {
    const results = {};
    const promises = [];
    for(let resourceKey in args) {
      if (!args.hasOwnProperty(resourceKey)) {
        continue;
      }

      let type = resourceKey;
      if (type === "entityUuid" && args.entityType) {
        type = this.resolveEntityType(args.entityType);
      }

      // skip if type doesn't contain `Uuid`
      if (type.indexOf("Uuid") === -1) {
        continue;
      }

      const promise = this.resolveResource(type, args[resourceKey]).then((result) => {
        results[type.replace("Uuid", "")] = result;
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

  resolveEntityType(entityType) {
    switch(entityType) {
      case Constants.ENTITY_DEPLOYMENT:
        return "deploymentUuid";
      case Constants.ENTITY_SERVICE_ACCOUNT:
        return "serviceAccountUuid";
      case Constants.ENTITY_WORKSPACE:
        return "workspaceUuid";
      case Constants.ENTITY_GROUP:
        return "groupUuid";
      default:
        return "";
    }
  }

  async resolveRequesterPermissions(session) {
    const permissions = await this.service("rbac").fetchPermissionsForSession(session);
    if (permissions.length > 0) {
      for(let permission of permissions) {
        session.permissions[permission] = true;
      }
    }
  }

  async emailConfirmationEnabled() {
    if (!Config.get(Config.SMTP_URI)) {
      return false;
    }
    const requireConfirmKey = this.model("system_setting").KEYS_USER_CONFIRMATION;
    const requireConfirm    = await this.service("system_setting").getSetting(requireConfirmKey);
    return (requireConfirm === true);
  }
}

module.exports = CommonService;