const Uuid = require('uuid/v4');

const Constants = require("../../constants.js");

const ROLE_PERMISSION_TABLE = "role_permission_map";
const ROLE_TABLE = "roles";
const SYSTEM_SETTING_TABLE = "system_settings";

const roles = [
  {
    label: "Deployment Service Account",
    category: "service_account",
    scope: "user",
    settings_key: Constants.SYSTEM_SETTING_DEPLOYMENT_ROLE_TEMPLATE,
    permissions: [
      "user_deployment_list",
      "user_deployment_view",
      "user_deployment_update",
      "user_deployment_delete",
      "user_deployment_resources",
      "user_deployment_images",
      "user_deployment_external",
    ]
  },
  {
    label: "Workspace Service Account",
    category: "service_account",
    scope: "user",
    settings_key: Constants.SYSTEM_SETTING_WORKSPACE_ROLE_TEMPLATE,
    permissions: [
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
    label: "System Service Account",
    category: "service_account",
    scope: "global",
    settings_key: Constants.SYSTEM_SETTING_SYSTEM_ROLE_TEMPLATE,
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

async function createRole(knex, payload) {
  const roleData = {
    uuid: Uuid(),
    label: payload.label,
    category: payload.category,
    entity_type: "",
    entity_uuid: null,
    scope: payload.scope,
    created_at: new Date().toISOString()
  };

  const role = (await knex(ROLE_TABLE).insert(roleData).returning("*"))[0];

  const permission_roles = [];
  for (let permission of payload.permissions) {
    permission_roles.push({
      role_uuid: role.uuid,
      permission_id: permission,
      created_at: new Date().toISOString(),
    });
  }

  await knex(ROLE_PERMISSION_TABLE).insert(permission_roles);

  return knex(SYSTEM_SETTING_TABLE).insert({
    key: payload.settings_key,
    value: role.uuid,
    category: "internal",
    is_encrypted: false,
    created_at: new Date().toISOString(),
  });
}

exports.up = function(knex) {
  let promises = [];

  // insert roles
  for (let payload of roles) {
    promises.push(createRole(knex, payload));
  }

  return Promise.all(promises);
};

exports.down = function(knex) {

};
