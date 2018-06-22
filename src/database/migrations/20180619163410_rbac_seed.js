const MigrationHelper = require("../migration_helpers.js");

const TABLE_NAME = "permissions";

const scopedPermissions = {
  "user": { // Permissions given to a User with an association of the object in which they are interacting with
    "user": { // An individual entity that has login credentials to access the system
      "view": "Requestor can review their own User information",
      "view_other": "Requestor can review information about other Users",
      "update": "Requestor can update their own information",
      "delete": "Requestor can delete themselves or another User",
      "service_account": "Requestor can manage Service Accounts specifically associated with them",
    },

    "group": { // Linking Users and Roles (permissions) to access all associated deployments
      "create": "Requestor can create Groups",
      "list": "Requestor can see a list of Groups within the platform",
      "view": "Requestor can see the information for a specific Group",
      "update": "Requestor can update the information for a specific Group",
      "delete": "Requestor can delete a specific Group",
    },

    "group_user": { // Individual Users linked to a Group
      "add": "Requestor can add another User to a specific Group",
      "remove": "Requestor can remove themselves or another User from a specific Group",
      "list": "Requestor can view all Users associated with a specific Group",
      "manage_permissions": "Requestor can add or remove Roles that are associated with a specific Group",
    },

    "role": { // Grouping of specific permission for the system
      "create": "Requestor can create a new Role",
      "list": "Requestor can view created Roles",
      "view": "Requestor can review information about a specific role",
      "update": "Requestor can update permissions within a specific role",
      "delete": "Requestor can remove this Role",
    },

    "team": { // Grouping of Groups
      "create": "Requestor can create a new Team",
      "list": "Requestor can view created Teams",
      "view": "Requestor can review information about a specific Team",
      "update": "Requestor can update details about a specific Team",
      "delete": "Requestor can Remove this Team",
    },

    "team_user": { // Individual Users linked to a Team
      "add": "Requestor can add another User to a specific Team",
      "remove": "Requestor can remove themselves or another User from a specific Team",
      "list": "Requestor can view Users associated with a Team",
    },

    "team_service_account": { // Individual Service Accounts linked to a Team
      "create": "Create service accounts for a team or deployment",
      "list": "List services accounts for team or deployments",
      "view": "View service accounts for team or deployment",
      "update": "Update service accounts for team or deployment",
      "delete": "Delete service accounts for team or deployment",
    },

    "deployment": { // A single instance within the system
      "create": "Requestor can create a new Deployment",
      "list": "Requestor can view created Deployments",
      "view": "Requestor can review information about a specific Deployment",
      "update": "Requestor can update details about a specific Deployment",
      "delete": "Requestor can remove a specific Deployment from the system",
      "resources": "Requestor can update details around computing resources allocated by the system for a specific Deployment",
      "images": "Requestor can update details around the Docker Image used by a specific Deployment",
      "external": "Requestor has access to view the integrated dashboard associated with a specific Deployment",
    },

    "deployment_service_account": { // Individual Service Accounts linked to a Deployment
      "create": "Create service accounts for a team or deployment",
      "list": "List services accounts for team or deployments",
      "view": "View service accounts for team or deployment",
      "update": "Update service accounts for team or deployment",
      "delete": "Delete service accounts for team or deployment",
    }
  },

  "global": { // Permissions given to a User without an association of the object in which they are interacting with. Those with system-wide access will be granted permissions within this context.
    "user": { // An individual entity that has login credentials to access the system
      "create": "Requestor can create a new User",
      "list": "Requestor can list all Users within the system",
      "view": "Requestor can review information about other Users",
      "update": "Requestor can update information about a specific User",
      "delete": "Requestor can delete themselves or another specific User",
    },

    "group": { // Linking Users, and defining their Roles (permissions), to access all associated deployments
      "create": "Requestor can create a new Group",
      "list": "Requestor can list all Groups within the system",
      "view": "Requestor can review information about a specific Group within the system",
      "update": "Requestor can update information about a specific Group within the system",
      "delete": "Requestor can delete a specific Group within the system",
    },

    "group_user": { // Individual Users linked to a Group
      "add": "Requestor can add an User to a specific Group",
      "remove": "Requestor can remove an User to a specific Group",
      "list": "Requestor can view all Users within a specific Group",
      "manage_permissions": "Requestor can add or remove Roles that are associated with a specific Group",
    },

    "role": { // Grouping of specific permission for the system
      "create": "Requestor can create a new Role",
      "list": "Requestor can view created Roles",
      "view": "Requestor can review information about a specific role",
      "update": "Requestor can update permissions within a specific role",
      "delete": "Requestor can remove this Role",
    },

    "team": { // Grouping of Groups
      "create": "Requestor can create a new Team",
      "list": "Requestor can view created Teams",
      "view": "Requestor can review information about a specific Team",
      "update": "Requestor can update details about a specific Team",
      "delete": "Requestor can Remove this Team",
    },

    "team_user": { // Individual Users linked to a Team
      "add": "Requestor can add another User to a specific Team",
      "remove": "Requestor can remove themselves or another User from a specific Team",
      "list": "Requestor can view Users associated with a Team",
      "invites": "Globally handle user invitations, including viewing the token",
    },

    "deployment": { // A single instance within the system
      "create": "Create a deployment on the behalf of any team",
      "list": "List the deployments of a given team or all teams",
      "view": "View details about any deployment in the system",
      "update": "Update any deployment in the system",
      "delete": "Delete any deployment in the system",
      "resources": "Change resource allocation for any deployment in the system",
      "images": "Deploy new docker images for any deployment in the system",
      "external": "View external resources related to any deployment",
    },

    "service_account": { // Individual Service Accounts that have access at a system level
      "create": "Requestor can create a Service Account with system-wide access",
      "list": "Requestor can view all Service Accounts with system-wide access",
      "view": "Requestor can review information about a specific Service Account with system-wide access",
      "update": "Requestor can update the details of a Service Accounts with system-wide access",
      "delete": "Requestor can remove a Service Accounts with system-wide access",
    },

    "system_setting": { // Ability to control specific system-wide configuration details
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
