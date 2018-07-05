const _ = require("lodash");
const BaseService = require("./base.js");

class GroupService extends BaseService {

  async fetchGroupByUuid(uuid, options = {}, throwError = true) {
    const group = await this.model("group")
      .query()
      .eager(options.relations)
      .findById(uuid);

    if (group) {
      return group;
    }
    if (throwError) {
      this.notFound("group", uuid);
    }
    return null;
  }

  async fetchGroupsByEntityUuid(entityType, entityUuid) {
    const groups = await this.model("group")
      .query()
      .joinEager("users.emails")
      .where({
        "groups.entity_type": entityType,
        "groups.entity_uuid": entityUuid,
      });

    if (groups && groups.length) {
      return groups;
    }
    return [];
  }

  async fetchGroupsByDeploymentUuid(deploymentUuid) {
    const groups = await this.model("group")
      .query()
      .joinEager("users.emails")
      .where({
        "groups.entity_type": this.model("group").ENTITY_DEPLOYMENT,
        "groups.entity_uuid": deploymentUuid,
      });

    if (groups && groups.length) {
      return groups;
    }
    return [];
  }

  async createGroup(payload, options = {}) {
    payload = Object.assign({
      entity_uuid: null,
      custom: true,
    }, payload);

    // TODO: Add label and description validation
    return await this.model("group").query(options.transaction).insertGraph([{
      label: payload.label,
      description: payload.description,
      entity_type: payload.entity_type || null,
      entity_uuid: payload.entity_uuid || null,
      custom: payload.custom
    }]).returning("*");
  }

  async createGroupFromTemplate(entityType, entityUuid, templateGroupUuid, options = {}) {
    const template = await this.fetchGroupByUuid(templateGroupUuid, options);
    return this.createGroup({
      label: template.label,
      description: template.description,
      entity_type: entityType,
      entity_uuid: entityUuid,
    }, options);
  }

  // TODO: Update this to get all templateGroupUuids in a single query and iterate over those
  async createGroupsFromTemplates(entityType, entityUuid, templateGroupUuids, options = {}) {
    const promises = [];

    for (let groupUuid of templateGroupUuids) {
      promises.push(this.createGroupFromTemplate(entityType, entityUuid, groupUuid, options));
    }
    return Promise.all(promises);
  }

  async updateGroup(group, payload) {
    let changes = {};

    // TODO: Do this check in a more extendable way
    if (payload["label"] !== undefined && payload.label !== group.label) {
      changes.label = payload.label;
    }
    if (payload["description"] !== undefined && payload.description !== group.description) {
      changes.description = payload.description;
    }

    if(Object.keys(changes).length === 0) {
      return false;
    }

    await group.$query().patch(changes).returning("*");
    return group;
  }

  async addUser(group, user) {
    return this.model("user_group").query()
      .insertGraph({
        user_uuid: user.uuid,
        group_uuid: group.uuid,
      });
  }

  async removeUser(group, user) {
    return group
      .$relatedQuery('users')
      .unrelate()
      .where({
        user_uuid: user.uuid,
        group_uuid: group.uuid,
      });
  }

  async deleteGroup(group) {
    return await group.$query().delete();
  }

  async deleteGroupByUuid(groupUuid) {
    return await this.model("group").query().deleteById(groupUuid);
  }
}

module.exports = GroupService;