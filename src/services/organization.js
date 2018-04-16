const BaseService = require("./base.js");

class OrganizationService extends BaseService {

  async fetchUserByUuid(uuid) {
    const org = await this.model("organization")
        .query()
        .whereNull("organizations.deleted_at")
        .findById(uuid);
    if (org) {
      return org;
    }
    return null;
  }

  async fetchFirst() {
    const org = await this.model("organization")
        .query()
        .whereNull("organizations.deleted_at")
        .first();

    if (org) {
      return org;
    }
    return null;
  }

  async create(title, description) {
    // TODO: Add title and description validation
    const OrganizationModel = this.model("organization");
    return await OrganizationModel
      .query()
      .insertGraph({
        title: title,
        description: description,
      }).returning("*");
  }
}

module.exports = OrganizationService;