const { BaseService } = require("@moilandtoil/sealab-application");
class CommonService extends BaseService {

  async healthcheckPostgres() {
    let { rows } = await this.conn("postgres").raw('SELECT version() as check');
    return rows.length === 1;
  }
}

module.exports = CommonService;