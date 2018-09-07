const BaseService = require("./base.js");
const ReleaseNamerUtil = require("../utils/releases_namer.js");

const deleteQueue = {};

class DeploymentService extends BaseService {

  async fetchAllDeploymentsByUserUuid(userUuid, throwError = true) {
    const deployments = await this.model("deployment")
      .query()
      .leftJoin("user_workspace_map", "user_workspace_map.workspace_uuid", "deployments.workspace_uuid")
      .where({
        "user_workspace_map.user_uuid": userUuid
      })
      .whereNot("status", this.model("deployment").STATUS_DELETING);

    if (deployments && deployments.length > 0) {
      return deployments;
    }
    if (throwError) {
      this.notFound("deployment", userUuid);
    }
    return [];
  }


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

  async createDeployment(workspace, payload) {
    try {
      const DeploymentModel = this.model("deployment");

      const releaseName = ReleaseNamerUtil.generate();

      payload.workspace_uuid = workspace.uuid;
      payload.release_name = releaseName;

      return await DeploymentModel
        .query()
        .insertGraph(payload).returning("*");
    } catch (err) {

      if(err.message.indexOf("unique_workspace_uuid_label") !== -1) {
        throw new Error(`Workspace already has a deployment named ${payload.label}`);
      }
      throw err;
    }
  }

  // return false if nothing to update, user on success, throw error on failure
  async updateDeployment(deployment, payload) {
    let changes = {};

    // TODO: Do this check in a more extendable way
    if (payload["config"] !== undefined && payload.config !== deployment.config) {
      // TODO: This is specific to airflow deploys. We need a way to set config values in the request that
      // won't get persisted so it never ends up here
      if (payload.config.fernetKey) {
        delete payload.config.fernetKey;
      }
      if (payload.config.redis && payload.config.redis.password) {
        delete payload.config.redis.password;
      }

      changes.config = payload.config;
    }
    if (payload["label"] !== undefined && payload.label !== deployment.label) {
      changes.label = payload.label;
    }
    if (payload["description"] !== undefined && payload.description !== deployment.description) {
      changes.description = payload.description;
    }
    if (payload["status"] !== undefined && payload.status !== deployment.status) {
      changes.status = payload.status;
    }
    if (payload["registryPassword"] !== undefined) {
      changes.registryPassword = payload.registryPassword;
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

  async queueDeploymentDeletion(deployment) {
    await this.service("deployment").updateDeployment(deployment, {
      "status": this.model("deployment").STATUS_DELETING
    });

    deleteQueue[deployment.uuid] = this.service("commander").deleteDeployment(deployment).then(async (response) => {
      await this.service("deployment").deleteDeploymentMetadata(deployment);
      this.info(`Deployment "${deployment.uuid} deleted successfully`);
      delete deleteQueue[deployment.uuid];
      return response;
    });
    return deployment;
  }

  async deleteDelpoyment(deployment) {
    await this.service("commander").deleteDeployment(deployment);
    return await this.deleteDeploymentMetadata(deployment);
  }

  async deleteDeploymentMetadata(deployment) {
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
