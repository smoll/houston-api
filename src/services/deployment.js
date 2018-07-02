const BaseService = require("./base.js");
const ReleaseNamerUtil = require("../utils/releases_namer.js");

class DeploymentService extends BaseService {

  async fetchDeploymentByUuid(deploymentUuid, throwError = true) {
    let deployment = await this.model("module_deployment")
      .query()
      .findOne("module_deployments.uuid", deploymentUuid);

    if (deployment) {
      return deployment;
    }
    if (throwError) {
      this.notFound("deployment", deploymentUuid);
    }
    return null;
  }

  async fetchDeploymentByTeamUuid(teamUuid, throwError = true) {
    const deployments = await this.model("module_deployment")
      .query()
      .where({
        "team_uuid": teamUuid,
      });

    if (deployments && deployments.length > 0) {
      return deployments;
    }
    if (throwError) {
      this.notFound("deployment", teamUuid);
    }
    return [];
  }

  async fetchDeploymentByReleaseName(releaseName, throwError = true) {
    // TODO: Once teams are fully implemented, Query for any deployment in any org user is apart of
    const deployment = await this.model("module_deployment")
        .query()
        .findOne({
          "release_name": releaseName,
        });
    if (deployment) {
      return deployment;
    }
    if (throwError) {
      this.notFound("deployment", releaseName);
    }
    return null;
  }

  async createDeployment(team, type, version, label) {
    try {
      const DeploymentModel = this.model("module_deployment");

      const releaseName = ReleaseNamerUtil.generate();

      const payload = {
        type: type,
        label: label,
        release_name: releaseName,
        version: version,
        team_uuid: team.uuid,
      };

      return await DeploymentModel
        .query()
        .insertGraph(payload).returning("*");
    } catch (err) {

      if(err.message.indexOf("unique constraint") !== -1 &&
         err.message.indexOf("module_deployments_team_uuid_label_unique") !== -1) {
        throw new Error(`Team already has a deployment named ${label}`);
      }
      throw err;
    }
  }

  // return false if nothing to update, user on success, throw error on failure
  async updateDeployment(deployment, payload) {
    let changes = {};

    // TODO: Do this check in a more extendable way
    if (payload["config"] !== undefined && payload.config !== deployment.config) {
      changes.config = payload.config;
    }
    if (payload["label"] !== undefined && payload.label !== deployment.label) {
      changes.label = payload.label;
    }
    if (payload["team"] !== undefined && payload.team && payload.team.uuid !== deployment.teamUuid) {
      changes.team_uuid = payload.team.uuid;
    }

    // TODO: Currently mutually exclusive to payload.config (will overwrite)
    if (payload["images"] !== undefined) {
      let config = deployment.getConfigCopy();
      let latest = this.computeImageChanges(config.images, payload['images']);
      if (latest) {
        config.images = latest;
        changes.config = config;
      }
    }

    if(Object.keys(changes).length > 0) {
      deployment = await deployment.$query().patch(changes).returning("*");
    }

    return deployment;
  }

  async updateDeploymentImage(deployment, image) {
    switch(deployment.type) {
      case this.model("module_deployment").MODULE_AIRFLOW:
        let config = deployment.getConfigCopy();
        config.images.airflow = image;
        return await this.updateDeployment(deployment, {
          config: config
        });
    }
  }

  async deleteDeployment(deployment) {
    return await deployment.$query().delete();
  }

  computeImageChanges(current, latest) {
    latest = Object.assign({}, latest);

    let changed = false;
    for(let key in latest) {
      if (!latest.hasOwnProperty(key)) {
        continue;
      }

      // if current images doesn't have the image, skip
      if (!current.hasOwnProperty(key)) {
        continue;
      }

      if (latest[key] !== current[key]) {
        changed = true;
        current[key] = latest[key];
      }
    }

    if (changed) {
      return current;
    }
    return false;
  }
}

module.exports = DeploymentService;