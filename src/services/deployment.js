const BaseService = require("./base.js");
const ReleaseNamerUtil = require("../utils/releases_namer.js");

class DeploymentService extends BaseService {

  async fetchByUuid(deploymentUuid) {
    let deployment = await this.model("module_deployment")
      .query()
      .joinEager("creator")
      .whereNull("module_deployments.deleted_at")
      .findOne("module_deployments.uuid", deploymentUuid);
    if (deployment) {
      return deployment;
    }
    return null;
  }

  async fetchByOrgUuid(orgUuid) {
    return await this.model("module_deployment")
      .query()
      .joinEager("creator")
      .whereNull("module_deployments.deleted_at")
      .where({
        "organization_uuid": orgUuid,
      });
  }

  async fetchByUserUuid(userUuid) {
    // TODO: Once orgs are fully implemented, Query for any deployment in any org user is apart of
    const deployments = await this.model("module_deployment")
      .query()
      .joinEager("creator")
      .whereNull("module_deployments.deleted_at");
    return deployments;
  }

  async fetchByReleaseName(releaseName) {
    // TODO: Once orgs are fully implemented, Query for any deployment in any org user is apart of
    const deployments = await this.model("module_deployment")
        .query()
        .joinEager("creator")
        .whereNull("module_deployments.deleted_at")
        .findOne({
          "release_name": releaseName,
        });
    return deployments;
  }

  async createDeployment(type, version, title, creator, organization = null, team = null) {
    try {
      const DeploymentModel = this.model("module_deployment");

      const releaseName = ReleaseNamerUtil.generate();

      const payload = {
        type: type,
        title: title,
        release_name: releaseName,
        version: version,
        creator_uuid: creator.uuid,
        organization_uuid: null,
        team_uuid: null
      };

      if (organization) {
        payload.organization_uuid = organization.uuid;
      }

      if (team) {
        payload.team_uuid = team.uuid;
      }

      return await DeploymentModel
        .query()
        .insertGraph(payload).returning("*");
    } catch (err) {
      if(err.message.indexOf("unique constraint") !== -1 &&
         err.message.indexOf("module_deployments_organization_uuid_title_unique") !== -1) {
        throw new Error(`Organization already has a deployment named ${title}`);
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
    if (payload["title"] !== undefined && payload.title !== deployment.title) {
      changes.title = payload.title;
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

  async deleteDeployment(deployment, hard = false) {
    if (hard) {
      return await deployment.$query().delete();
    } else {
      return await deployment.$query().patch({
        deleted_at: new Date().toISOString()
      }).returning("*");
    }
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