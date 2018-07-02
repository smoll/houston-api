const BaseService = require("./base.js");

class CommonService extends BaseService {

  async healthcheckPostgres() {
    let { rows } = await this.conn("postgres").raw('SELECT version() as check');
    return rows.length === 1;
  }

  async resourceResolver(resources) {
    const results = {};
    const promises = [];
    for(let resourceKey in resources) {
      if (!resources.hasOwnProperty(resourceKey)) {
        continue;
      }

      const promise = this.resolveResource(resourceKey, resources[resourceKey]).then((result) => {
        results[resourceKey.replace("Uuid", "")] = result;
      });

      promises.push(promise);
    }

    return Promise.all(promises).then(() => {
      return results;
    });
  }

  resolveResource(resourceType, resourceUuid) {
    switch(resourceType) {
      case "deploymentUuid":
        return this.service("deployment").fetchDeploymentByUuid(resourceUuid);
      case "groupUuid":
        return this.service("group").fetchGroupByUuid(resourceUuid);
      case "inviteUuid":
        return this.service("invite_token").fetchInviteByUuid(resourceUuid);
      case "serviceAccountUuid":
        return this("service_account").fetchServiceAccountByUuid(resourceUuid);
      case "teamUuid":
        return this.service("team").fetchTeamByUuid(resourceUuid);
      case "userUuid":
        return this.service("user").fetchUserByUuid(resourceUuid);
    }
  }
}

module.exports = CommonService;