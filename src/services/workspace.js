const _ = require("lodash");
const BaseService = require("./base.js");

const Transaction = require('objection').transaction;

class WorkspaceService extends BaseService {

  async fetchWorkspaceByUuid(uuid, options = {}, throwError = true) {
    const workspace = await this.model("workspace")
      .query()
      .eager(options.relations || [])
      .findById(uuid);
    if (workspace) {
      return workspace;
    }
    if (throwError) {
      this.notFound("workspace", uuid);
    }
    return null;
  }

  async fetchWorkspacesByUserUuid(uuid, options = {}) {
    const workspaces = await this.model("workspace")
      .query()
      .joinRelation("users")
      .eager(options.relations || [])
      .where("users_join.user_uuid", uuid);

    if (workspaces) {
      return workspaces;
    }
    return null;
  }

  async createWorkspace(user, payload, options = {}) {
    // TODO: Add label and description validation
    return await this.model("workspace").query(options.transaction || undefined).insertGraph({
      label: payload.label,
      description: payload.description,
      users: [
        {
          uuid: user.uuid,
          created_at: new Date().toISOString()
        },
      ]
    }, {
      relate: "users"
    }).returning("*");
  }

  async createWorkspaceWithDefaultGroups(user, payload) {
    // Determine default workspace groups
    const DEFAULT_GROUPS_KEY = this.model("system_setting").KEY_DEFAULT_WORKSPACE_GROUPS;
    let groupTemplates = await this.service("system_setting").getSetting(DEFAULT_GROUPS_KEY);
    if (groupTemplates && groupTemplates.length > 0) {
      groupTemplates = groupTemplates.split(",");
    } else {
      groupTemplates = [];
    }

    return await Transaction(this.conn("postgres"), async (trx) => {
      const options = {
        transaction: trx
      };

      // create workspace
      const workspace = await this.createWorkspace(user, payload, options);

      // create default groups for workspace
      const groups = await this.service("group").createGroupsFromTemplates(this.model("group").ENTITY_WORKSPACE, workspace.uuid, groupTemplates, options);
      const promises = [];
      for(let group of groups) {
        promises.push(this.service("group").addUser(group, user, options));
      }
      await Promise.all(promises);
      // return workspace
      return workspace;
    });
  }

  async updateWorkspace(workspace, payload) {
    let changes = {};

    // TODO: Do this check in a more extendable way
    if (payload["label"] !== undefined && payload.label !== workspace.label) {
      changes.label = payload.label;
    }
    if (payload["description"] !== undefined && payload.description !== workspace.description) {
      changes.description = payload.description;
    }

    if(Object.keys(changes).length === 0) {
      return false;
    }

    await workspace.$query().patch(changes).returning("*");
    return workspace;
  }

  async addUser(workspace, user) {
    return this.model("user_workspace").query()
      .insertGraph({
        user_uuid: user.uuid,
        workspace_uuid: workspace.uuid,
      });
  }

  async removeUser(workspace, user) {
    return this.model("user_workspace").query()
      .deleteById([user.uuid, workspace.uuid]);
  }

  async deleteWorkspace(workspace) {
    return await workspace.$query().delete();
  }

  async deletWorkspaceByUuid(workspaceUuid) {
    return await this.model("workspace").query().deleteById(workspaceUuid);
  }
}

module.exports = WorkspaceService;