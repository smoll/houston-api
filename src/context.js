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

    this.permissions = {
      user: {
        view_self: false,
        edit_self: false,
        edit_other: false,
        create_org: false,
      },
      // org: {
      //   // owner will be all true
      //   // admin will be all true
      //   view_self: false,
      //   edit_self: false,
      //   delete_self: false,
      //
      //   view_sources: false,
      //   create_sources: false,
      //   edit_sources: false,
      //   delete_sources: false,
      //
      //   view_destinations: false,
      //   create_destinations: false,
      //   edit_destinations: false,
      //   delete_destinations: false,
      //
      //   manage_users: false,
      //
      //   view_connections: false,
      //   create_connections: false,
      //   edit_connections: false,
      //   delete_connections: false,
      //
      //   airflow_status: false,
      //   airflow_info: false,
      //   airflow_deploy: false,
      //   airflow_admin: false,
      // }
    };

    // This should never be used for user level endpoint permissions.
    this.isSuperAdmin = false;
    this.authUser = null;
    // this.org = null;
    this.origin = null;

    // TODO: Populate this resource cache per request based on entrypoint
    // args like "userId", "orgId", "deploymentId", "teamId", "sourceId", or "destinationId"

    // cache of resources as determine by the graphql entrypoint
    this.resources = {
      user: null,
      organization: null,
      team: null,
      deployment: null,
    };
  }

  setAuthUser(user) {
    this.authUser = user;

    // TODO: This is temporary, remove once we have property hook in place to
    // set these based on gql entrypoint
    this.resources.user = user;
    if (this.authUser.superAdmin) {
      this.setSuperAdmin();
    } else {
      this.permissions.user.view_self = true;
      this.permissions.user.edit_self = true;
      // this.permissions.user.create_org = true;
    }
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

module.exports = Context;
