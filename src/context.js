const _ = require("lodash");

// Note: Copied from astronomerio/houston, commented out resources houston-api doesn't have yet

class Context {
  constructor(authorization = null, requester = Context.REQUESTER_USER) {
    this.requester = requester;
    this.authorization = authorization;
    this.token = {
      valid: true,
      expired: false,
    };
    this.req = null;
    this.res = null;

    this.permissions = {
      user: {

        ////// USER LEVEL (Specific to objects associated with a user)

        // user
        user_user_view: false,
        user_user_view_other: false,
        user_user_update: false,
        user_user_delete: false,

        // groups
        user_group_create: false,
        user_group_list: false,
        user_group_view: false,
        user_group_update: false,
        user_group_delete: false,

        // group users
        user_group_user_add: false,
        user_group_user_remove: false,
        user_group_user_list: false,
        user_group_user_manage_permissions: false,

        // roles
        user_role_create: false,
        user_role_list: false,
        user_role_view: false,
        user_role_update: false,
        user_role_delete: false,

        // workspaces
        user_workspace_create: false,
        user_workspace_list: false,
        user_workspace_view: false,
        user_workspace_update: false,
        user_workspace_delete: false,

        // workspace users
        user_workspace_user_add: false,
        user_workspace_user_remove: false,
        user_workspace_user_list: false,

        user_deployment_create: false,
        user_deployment_list: false,
        user_deployment_view: false,
        user_deployment_update: false,
        user_deployment_delete: false,
        user_deployment_deploy: false,
        user_deployment_external: false,

        // service accounts
        user_service_account_create: false,
        user_service_account_list: false,
        user_service_account_view: false,
        user_service_account_update: false,
        user_service_account_delete: false,

        ////// GLOBAL LEVEL (All objects in the system)

        // users
        global_user_create: false,
        global_user_list: false,
        global_user_view: false,
        global_user_update: false,
        global_user_delete: false,

        // groups
        global_group_create: false,
        global_group_list: false,
        global_group_view: false,
        global_group_update: false,
        global_group_delete: false,

        // group users
        global_group_user_add: false,
        global_group_user_remove: false,
        global_group_user_list: false,
        global_group_user_manage_permissions: false,

        // roles
        global_role_create: false,
        global_role_list: false,
        global_role_view: false,
        global_role_update: false,
        global_role_delete: false,

        // workspaces
        global_workspace_create: false,
        global_workspace_list: false,
        global_workspace_view: false,
        global_workspace_update: false,
        global_workspace_delete: false,

        // workspace users
        global_workspace_user_add: false,
        global_workspace_user_remove: false,
        global_workspace_user_invites: false,
        global_workspace_user_list: false,

        // deployments
        global_deployment_create: false,
        global_deployment_list: false,
        global_deployment_view: false,
        global_deployment_update: false,
        global_deployment_delete: false,
        global_deployment_deploy: false,
        global_deployment_external: false,

        // service accounts
        global_service_create: false,
        global_service_list: false,
        global_service_view: false,
        global_service_update: false,
        global_service_delete: false,

        global_system_setting_list: false,
        global_system_setting_view: false,
        global_system_setting_update: false,
      }
    };

    // This should never be used for user level endpoint permissions.
    this.authUser = null;
    // this.org = null;
    this.origin = null;

    // TODO: Populate this resource cache per request based on entrypoint
    // args like "userId", "orgId", "deploymentId", "workspaceId", "sourceId", or "destinationId"

    // cache of resources as determine by the graphql entrypoint
    this.resources = {
      user: null,
      workspace: null,
      deployment: null,
    };
  }

  debugOutput() {
    console.log({
      requester: this.requester,
      authorization: this.authorization,
      token: this.token,
      permissions: this.permissions,
      authUser: this.authUser,
      origin: this.origin,
      resources: this.resources
    });
  }

  setAuthUser(user) {
    this.authUser = user;
  }

  setSuperAdmin() {
    this.isSuperAdmin = true;
    function setObjectKeysToTrue(object) {
      for(let key in object) {
        if (!object.hasOwnProperty(key)) {
          continue;
        }
        if (_.isObject(object[key])) {
          object[key] = setObjectKeysToTrue(object[key]);
        } else {
          object[key] = true;
        }
      }
      return object;
    }

    this.permissions = setObjectKeysToTrue(this.permissions);
  }

  setPerm(group, key, value) {
    this.permissions[group][key] = value;
  }

  userUuid() {
    if (this.authUser) {
      return this.authUser.uuid;
    }
    return null;
  }

  hasPermissions(permissions) {
    if (!_.isArray(permissions)) {
      permissions = [permissions];
    }



  }

  // orgId() {
  //   if (this.org) {
  //     return this.org.uui;
  //   }
  //   return null;
  // }
  //
  // serviceId() {
  //   if (this.service) {
  //     return this.service.apiKey.toString();
  //   }
  //   return null;
  // }
  //
  // inOrg() {
  //   return this.orgOwner || this.orgUser || this.isSuperAdmin;
  // }
}

Context.REQUESTER_USER = "user";
Context.REQUESTER_SERVICE = "service";
Context.REQUESTER_SYSTEM = "system";

module.exports = Context;
