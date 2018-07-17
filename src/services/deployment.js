const BaseService = require("./base.js");
const ReleaseNamerUtil = require("../utils/releases_namer.js");

const deleteQueue = {};

class DeploymentService extends BaseService {

  async fetchDeploymentByUuid(deploymentUuid, throwError = true) {
    let deployment = await this.model("deployment")
      .query()
      .joinEager("workspace")
      .findOne("deployments.uuid", deploymentUuid);

    if (deployment) {
      return deployment;
    }
    if (throwError) {
      this.notFound("deployment", deploymentUuid);
    }
    return null;
  }

  async fetchDeploymentByWorkspaceUuid(workspaceUuid, throwError = true) {
    const deployments = await this.model("deployment")
      .query()
      .where({
        "workspace_uuid": workspaceUuid,
      })
      .whereNot("status", this.model("deployment").STATUS_DELETING);

    if (deployments && deployments.length > 0) {
      return deployments;
    }
    if (throwError) {
      this.notFound("deployment", workspaceUuid);
    }
    return [];
  }

  async fetchDeploymentByReleaseName(releaseName, throwError = true) {
    const deployment = await this.model("deployment")
      .query()
      .joinEager("workspace")
      .whereNot("status", this.model("deployment").STATUS_DELETING)
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

  async createDeployment(workspace, type, version, label) {
    try {
      const DeploymentModel = this.model("deployment");

      const releaseName = ReleaseNamerUtil.generate();

      const payload = {
        type: type,
        label: label,
        release_name: releaseName,
        version: version,
        workspace_uuid: workspace.uuid,
      };

      return await DeploymentModel
        .query()
        .insertGraph(payload).returning("*");
    } catch (err) {

      if(err.message.indexOf("unique constraint") !== -1 &&
         err.message.indexOf("deployments_workspace_uuid_label_unique") !== -1) {
        throw new Error(`Workspace already has a deployment named ${label}`);
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
    if (payload["status"] !== undefined && payload.status !== deployment.status) {
      changes.status = payload.status;
    }
    // if (payload["workspace"] !== undefined && payload.workspace && payload.workspace.uuid !== deployment.workspaceUuid) {
    //   changes.workspace_uuid = payload.workspace.uuid;
    // }

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

  async updateDeploymentImage(deployment, image, tag) {
    switch(deployment.type) {
      case this.model("deployment").MODULE_AIRFLOW:
        let config = deployment.getConfigCopy();
        if (config.images === undefined) {
          config.images = {};
        }
        config.images.airflow = {
          name: image,
          tag: tag
        };
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