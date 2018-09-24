const BaseService = require("./base.js");
const ElasticsearchClient = require("../clients/elasticsearch.js");

class ElasticsearchService extends BaseService {

  constructor() {
    super(...arguments);
    this.elasticsearch = new ElasticsearchClient();
  }

  async fetchDeploymentLogs(deployment, component, startTime, endTime) {
  	const release = deployment.releaseName;
  	const workspace = deployment.workspaceUuid;
  	// return await this.elasticsearch.search(component, workspace, release, startTime, endTime);

	return [{
		timestamp: currentDate.getTime().toString(),
		level: interval.toString(),
		message: 'Output test'
	},{
		timestamp: "now",
		level: "error",
		message: 'Still not implemented'
	}];

  }

}

module.exports = ElasticsearchService;
