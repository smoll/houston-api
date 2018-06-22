const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "permissions";

const scopedPermissions = {
  "user": {
    "user": {
      "view": "User user_view",
      "view_other": "User user_view_other",
      "update": "User user_update",
      "delete": "User user_delete",
      "service_account": "Manager own user service accounts",
    },

    "group": {
      "create": "User group_create",
      "list": "User group_list",
      "view": "User group_view",
      "update": "User group_update",
      "delete": "User group_delete",
    },

    "group_user": {
      "add": "User group_user_add",
      "remove": "User group_user_remove",
      "list": "User group_user_list",
      "manage_permissions": "User group_user_manage_permissions",
    },

    "role": {
      "create": "User role_create",
      "list": "User role_list",
      "view": "User role_view",
      "update": "User role_update",
      "delete": "User role_delete",
    },

    "team": {
      "create": "User team_create",
      "list": "User team_list",
      "view": "User team_view",
      "update": "User team_update",
      "delete": "User team_delete",
    },

    "team_user": {
      "add": "User team_user_add",
      "remove": "User team_user_remove",
      "list": "User team_user_list",
    },

    "team_service_account": {
      "create": "Create service accounts for a team or deployment",
      "list": "List services accounts for team or deployments",
      "view": "View service accounts for team or deployment",
      "update": "Update service accounts for team or deployment",
      "delete": "Delete service accounts for team or deployment",
    },

    "deployment": {
      "create": "User deployment_create",
      "list": "User deployment_list",
      "view": "User deployment_view",
      "update": "User deployment_update",
      "delete": "User deployment_delete",
      "resources": "Update deployment resource allocation",
      "images": "Update deployment docker images",
      "external": "User deployment_dashboard",
    },

    "deployment_service_account": {
      "create": "Create service accounts for a team or deployment",
      "list": "List services accounts for team or deployments",
      "view": "View service accounts for team or deployment",
      "update": "Update service accounts for team or deployment",
      "delete": "Delete service accounts for team or deployment",
    }
  },

  "global": {
    "user": {
      "create": "Global user_create",
      "list": "Global user_list",
      "view": "Global user_view",
      "update": "Global user_update",
      "delete": "Global user_delete",
    },

    "group": {
      "create": "Global group_create",
      "list": "Global group_list",
      "view": "Global group_view",
      "update": "Global group_update",
      "delete": "Global group_delete",
    },

    "group_user": {
      "add": "Global group_user_add",
      "remove": "Global group_user_remove",
      "list": "Global group_user_list",
      "manage_permissions": "Global group_user_manage_permissions",
    },

    "role": {
      "create": "Global role_create",
      "list": "Global role_list",
      "view": "Global role_view",
      "update": "Global role_update",
      "delete": "Global role_delete",
    },

    "team": {
      "create": "Global team_create",
      "list": "Global team_list",
      "view": "Global team_view",
      "update": "Global team_update",
      "delete": "Global team_delete",
    },

    "team_user": {
      "add": "Global team_user_add",
      "remove": "Global team_user_remove",
      "invites": "Globally handle user invitations, including viewing the token",
      "list": "Global team_user_list",
    },

    "deployment": {
      "create": "Create a deployment on the behalf of any team",
      "list": "List the deployments of a given team or all teams",
      "view": "View details about any deployment in the system",
      "update": "Update any deployment in the system",
      "delete": "Delete any deployment in the system",
      "resources": "Change resource allocation for any deployment in the system",
      "images": "Deploy new docker images for any deployment in the system",
      "external": "View external resources related to any deployment",
    },

    "service_account": {
      "create": "Global service_account_create",
      "list": "Global service_account_list",
      "view": "Global service_account_view",
      "update": "Global service_account_update",
      "delete": "Global service_account_delete",
    },

    "system_setting": {
      "list": "Ability to list system settings",
      "view": "Ability to view raw value of system settings",
      "update": "Ability to update the value of system settings",
    }
  }
};

const roles = [
  {
    label: "Manage self",
    category: "user",
    permissions: [

    ]
  },
  {
    label: "Create teams",
    category: "team",
    permissions: [

    ]
  },
  {
    label: "View team details",
    category: "team",
    permissions: [

    ]
  },
  {
    label: "Manage team users",
    category: "team",
    permissions: [

    ]
  },
  {
    label: "Manage team service accounts",
    category: "team",
    permissions: [

    ]
  },
  {
    label: "Manage team",
    category: "team",
    permissions: [

    ]
  },
  {
    label: "Manage team deployments",
    category: "team",
    permissions: [

    ]
  },
  {
    label: "Push team images",
    category: "team",
    permissions: [

    ]
  },
  {
    label: "Full system permissions",
    category: "global",
    permissions: [

    ]
  },


exports.up = function(knex) {
  let promises = [];

  // insert permissions
  for(let scope in scopedPermissions) {
    if (!scopedPermissions.hasOwnProperty(scope)) {
      continue;
    }
    const inserts = [];
    for(let category in scopedPermissions[scope]) {
      if (!scopedPermissions[scope].hasOwnProperty(category)) {
        continue;
      }

      const payload = scopedPermissions[scope][category];

      for(let id in payload) {
        if (!payload.hasOwnProperty(id)){
          continue;
        }
        const label = payload[id];
        inserts.push({
          id: `${scope}_${category}_${id}`,
          scope: scope,
          label: label,
          category: category
        });
      }
    }
    promises.push(knex(TABLE_NAME).insert(inserts));
  }

  // insert roles
  for(let scope in scopedPermissions) {
    if (!scopedPermissions.hasOwnProperty(scope)) {
      continue;
    }
    const inserts = [];
    for(let category in scopedPermissions[scope]) {
      if (!scopedPermissions[scope].hasOwnProperty(category)) {
        continue;
      }

      const payload = scopedPermissions[scope][category];

      for(let id in payload) {
        if (!payload.hasOwnProperty(id)){
          continue;
        }
        const label = payload[id];
        inserts.push({
          id: `${scope}_${category}_${id}`,
          scope: scope,
          label: label,
          category: category
        });
      }
    }
    promises.push(knex(TABLE_NAME).insert(inserts));
  }

  return Promise.all(promises);
};

exports.down = function(knex) {
  let promises = [];
  for(let scope in scopedPermissions) {
    if (!scopedPermissions.hasOwnProperty(scope)) {
      continue;
    }
    const ids = [];
    for(let category in scopedPermissions[scope]) {
      if (!scopedPermissions[scope].hasOwnProperty(category)) {
        continue;
      }
      const payload = scopedPermissions[scope][category];
      for(let id in payload) {
        if (!payload.hasOwnProperty(id)){
          continue;
        }
        ids.push(`${scope}_${category}_${id}`);
      }
    }

    promises.push(knex(TABLE_NAME).where((builder) => {
      builder.where("scope", scope);
      builder.whereIn("id", Object.values(ids));
    }));
  }
  return Promise.all(promises);
};
