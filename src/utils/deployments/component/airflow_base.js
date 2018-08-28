const BaseDeployment = require("./base");
const Config = require("../../config.js");

class AirflowBaseDeployment extends BaseDeployment {
  airflowUrl(releaseName, includeProtocol = false) {
    const url = `${releaseName}-airflow.${Config.baseDomain()}`;
    if (includeProtocol) {
      return `https://${url}`;
    }
    return url;
  }
}

module.exports = AirflowBaseDeployment;