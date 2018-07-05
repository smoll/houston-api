const Uuid = require('uuid/v4');

const MigrationHelper = require("../migration_helpers.js");

const PERMISSION_TABLE = "permissions";
const ROLE_PERMISSION_TABLE = "role_permission_map";
const ROLE_TABLE = "roles";
const GROUP_TABLE = "groups";
const GROUP_ROLE_TABLE = "group_role_map";
const SYSTEM_SETTING_TABLE = "system_settings";

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

    "workspace": { // Grouping of Groups
      "create": "Requestor can create a new Workspace",
      "list": "Requestor can view created Workspaces",
      "view": "Requestor can review information about a specific Workspace",
      "update": "Requestor can update details about a specific Workspace",
      "delete": "Requestor can Remove this Workspace",
    },

    "workspace_user": { // Individual Users linked to a Workspace
      "add": "Requestor can add another User to a specific Workspace",
      "remove": "Requestor can remove themselves or another User from a specific Workspace",
      "list": "Requestor can view Users associated with a Workspace",
    },

    "workspace_service_account": { // Individual Service Accounts linked to a Workspace
      "create": "Create service accounts for a workspace or deployment",
      "list": "List services accounts for workspace or deployments",
      "view": "View service accounts for workspace or deployment",
      "update": "Update service accounts for workspace or deployment",
      "delete": "Delete service accounts for workspace or deployment",
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
      "create": "Create service accounts for a workspace or deployment",
      "list": "List services accounts for workspace or deployments",
      "view": "View service accounts for workspace or deployment",
      "update": "Update service accounts for workspace or deployment",
      "delete": "Delete service accounts for workspace or deployment",
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

    "workspace": { // Grouping of Groups
      "create": "Requestor can create a new Workspace",
      "list": "Requestor can view created Workspaces",
      "view": "Requestor can review information about a specific Workspace",
      "update": "Requestor can update details about a specific Workspace",
      "delete": "Requestor can Remove this Workspace",
    },

    "workspace_user": { // Individual Users linked to a Workspace
      "add": "Requestor can add another User to a specific Workspace",
      "remove": "Requestor can remove themselves or another User from a specific Workspace",
      "list": "Requestor can view Users associated with a Workspace",
      "invites": "Globally handle user invitations, including viewing the token",
    },

    "deployment": { // A single instance within the system
      "create": "Create a deployment on the behalf of any workspace",
      "list": "List the deployments of a given workspace or all workspaces",
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

const groupDesc = {
  "default_user": "Permissions all users in the system should have by default",
  "default_admin": "Permissions all users in the system should have by default",
  "template_workspace_owner": "Template for the default workspace owner group",
  "template_workspace_admin": "Template for the default workspace admin group",
  "template_workspace_user": "Template for the default workspace user group",
};

const roles = [
  {
    label: "Manage self",
    category: "user",
    scope: "user",
    groups: ["default_user"],
    permissions: [
      "user_user_view",
      "user_user_update",
      "user_user_delete",
      "user_user_service_account",
      "user_workspace_list",
    ]
  },
  {
    label: "Create workspaces",
    category: "workspace",
    scope: "user",
    groups: ["default_user"],
    permissions: [
      "user_workspace_create",
    ]
  },
  {
    label: "View workspace details",
    category: "workspace",
    scope: "user",
    groups: ["template_workspace_user"],
    permissions: [
      "user_group_list",
      "user_group_view",
      "user_group_user_list",
      "user_workspace_view",
      "user_workspace_user_list"
    ]
  },
  {
    label: "Manage workspace users",
    category: "workspace",
    scope: "user",
    groups: ["template_workspace_admin", "template_workspace_owner"],
    permissions: [
      "user_group_list",
      "user_group_view",
      "user_group_user_add",
      "user_group_user_remove",
      "user_group_user_list",
      "user_group_user_manage_permissions",
      "user_workspace_user_add",
      "user_workspace_user_remove",
      "user_workspace_user_list",
    ]
  },
  {
    label: "Manage workspace service accounts",
    category: "workspace",
    scope: "user",
    groups: ["template_workspace_admin", "template_workspace_owner"],
    permissions: [
      "user_workspace_service_account_create",
      "user_workspace_service_account_list",
      "user_workspace_service_account_view",
      "user_workspace_service_account_update",
      "user_workspace_service_account_delete",
    ]
  },
  {
    label: "Manage workspace",
    category: "workspace",
    scope: "user",
    groups: ["template_workspace_owner"],
    permissions: [
      "user_group_create",
      "user_group_list",
      "user_group_view",
      "user_group_update",
      "user_group_delete",
      "user_group_user_add",
      "user_group_user_remove",
      "user_group_user_list",
      "user_group_user_manage_permissions",
      "user_role_create",
      "user_role_list",
      "user_role_view",
      "user_role_update",
      "user_role_delete",
      "user_workspace_list",
      "user_workspace_view",
      "user_workspace_update",
      "user_workspace_delete",
      "user_workspace_user_add",
      "user_workspace_user_remove",
      "user_workspace_user_list",
      "user_workspace_service_account_create",
      "user_workspace_service_account_list",
      "user_workspace_service_account_view",
      "user_workspace_service_account_update",
      "user_workspace_service_account_delete",
      "user_deployment_service_account_create",
      "user_deployment_service_account_list",
      "user_deployment_service_account_view",
      "user_deployment_service_account_update",
      "user_deployment_service_account_delete",
    ]
  },
  {
    label: "Manage workspace deployments",
    category: "workspace",
    scope: "user",
    groups: ["template_workspace_admin", "template_workspace_owner"],
    permissions: [
      "user_deployment_create",
      "user_deployment_list",
      "user_deployment_view",
      "user_deployment_update",
      "user_deployment_delete",
      "user_deployment_resources",
      "user_deployment_images",
      "user_deployment_external",
      "user_deployment_service_account_create",
      "user_deployment_service_account_list",
      "user_deployment_service_account_view",
      "user_deployment_service_account_update",
      "user_deployment_service_account_delete",
    ]
  },
  {
    label: "Push workspace images",
    category: "workspace",
    scope: "user",
    groups: ["template_workspace_user", "template_workspace_admin", "template_workspace_owner"],
    permissions: [
      "user_deployment_images",
    ]
  },

  {
    label: "Full system permissions",
    category: "global",
    scope: "global",
    groups: ["default_admin"],
    permissions: [
      "global_user_create",
      "global_user_list",
      "global_user_view",
      "global_user_update",
      "global_user_delete",
      "global_group_create",
      "global_group_list",
      "global_group_view",
      "global_group_update",
      "global_group_delete",
      "global_group_user_add",
      "global_group_user_remove",
      "global_group_user_list",
      "global_group_user_manage_permissions",
      "global_role_create",
      "global_role_list",
      "global_role_view",
      "global_role_update",
      "global_role_delete",
      "global_workspace_create",
      "global_workspace_list",
      "global_workspace_view",
      "global_workspace_update",
      "global_workspace_delete",
      "global_workspace_user_add",
      "global_workspace_user_remove",
      "global_workspace_user_list",
      "global_workspace_user_invites",
      "global_deployment_create",
      "global_deployment_list",
      "global_deployment_view",
      "global_deployment_update",
      "global_deployment_delete",
      "global_deployment_resources",
      "global_deployment_images",
      "global_deployment_external",
      "global_service_account_create",
      "global_service_account_list",
      "global_service_account_view",
      "global_service_account_update",
      "global_service_account_delete",
      "global_system_setting_list",
      "global_system_setting_view",
      "global_system_setting_update",
    ]
  },
];

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
          category: category,
          created_at: new Date().toISOString(),
        });
      }
    }
    promises.push(knex(PERMISSION_TABLE).insert(inserts));
  }

  // insert roles
  const groups = {};
  for (let payload of roles) {
    const role = {
      uuid: Uuid(),
      label: payload.label,
      category: payload.category,
      entity_type: "",
      entity_uuid: null,
      scope: payload.scope,
      created_at: new Date().toISOString()
    };

    for (let group of payload.groups) {
      if (!groups.hasOwnProperty(group)) {
        groups[group] = [];
      }
      groups[group].push(role.uuid);
    }

    const insert = knex(ROLE_TABLE).insert(role).then(() => {
      const permission_roles = [];
      for (let permission of payload.permissions) {
        permission_roles.push({
          role_uuid: role.uuid,
          permission_id: permission,
          created_at: new Date().toISOString(),
        });
      }
      return knex(ROLE_PERMISSION_TABLE).insert(permission_roles);
      
    });
    promises.push(insert);
  }

  return Promise.all(promises).then(() => {
    const groupInserts = [];

    const settings = {
      users: {
        key:  "users_group_uuid",
        uuid: null
      },
      admin: {
        key:  "admin_group_uuid",
        uuid: null
      },
      template: {
        key:  "default_workspace_groups",
        uuid: []
      },
    };

    for (let group in groups) {
      if (!groups.hasOwnProperty(group)) {
        continue;
      }

      const groupUuid = Uuid();

      // Add global groups
      groupInserts.push(knex(GROUP_TABLE).insert({
        uuid: groupUuid,
        label: group,
        description: groupDesc[group],
        entity_type: "SYSTEM",
        entity_uuid: null,
        custom: false,
        active: true,
        created_at: new Date().toISOString(),
      }));

      for (let roleUuid of groups[group]) {
        groupInserts.push(knex(GROUP_ROLE_TABLE).insert({
          group_uuid: groupUuid, role_uuid: roleUuid, created_at: new Date().toISOString(),
        }));
      }

      switch (group) {
        case "default_user":
          settings.users.uuid = groupUuid;
          break;
        case "default_admin":
          settings.admin.uuid = groupUuid;
          break;
        default:
          settings.template.uuid.push(groupUuid);
          break;
      }
    }

    settings.template.uuid = settings.template.uuid.join(",");
    for (let key in settings) {
      if (!settings.hasOwnProperty(key)) {
        continue;
      }

      let setting = settings[key];

      groupInserts.push(knex(SYSTEM_SETTING_TABLE).insert({
        key: setting.key,
        value: setting.uuid,
        category: "internal",
        is_encrypted: false,
        created_at: new Date().toISOString(),
      }));
    }

    return Promise.all(groupInserts);
  });
};

exports.down = function(knex) {
};
