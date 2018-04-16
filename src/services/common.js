const BaseService = require("./base.js");

class CommonService extends BaseService {

  async healthcheckPostgres() {
    let { rows } = await this.conn("postgres").raw('SELECT version() as check');
    return rows.length === 1;
  }

  async resourceResolver(resources) {
    const results = {};
    for(let resourceKey in resources) {
      if (!resources.hasOwnProperty(resourceKey)) {
        continue;
      }

      const uuid = resources[resourceKey];

      results[resourceKey] = await (async () => {
        switch(resourceKey) {
          case "userUuid":
            return this.service("user").fetchByUuid(uuid);
          case "orgUuid":
            return null;
          case "deploymentUuid":
            return this.service("deployment").fetchByUuid(uuid);
          case "teamUuid":
            return null;
        }
      })();
    }
  }
}

module.exports = CommonService;