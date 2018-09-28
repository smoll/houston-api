const BaseService = require("./base.js");

const DotObject = require("../utils/dot_object.js");
const ReleaseNamerUtil = require("../utils/releases_namer.js");
const Semver = require("semver");

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
  async updateDeployment(deployment, payload, options = {}) {
    let properties = ["label", "description", "config", "status", "registryPassword", "version"];
    if (options.properties) {
      properties = options.properties;
    }

    // if payload.config is set and the function is allowed to edit the config
    const modifyConfig = ~properties.indexOf("config") && payload.config;
    let deployConfig;

    // merge config changes into existing config
    if (modifyConfig) {
      deployConfig = new DotObject(deployment.config);
      deployConfig.merge(payload.config);
      delete payload.config;
    }

    // create mutation object
    const changes = this.filterChanges(deployment, payload, properties);

    // add merged config to mutation object
    if (modifyConfig) {

      changes.config = deployConfig.get();
    }

    if(Object.keys(changes).length > 0) {
      console.log("Updating deployment");
      console.log(changes);
      deployment = await deployment.$query(options.transaction).patch(changes).returning("*");
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

        if (Semver.gt(version, "0.6.1")) {
          config.images.airflow = {
            repository: image,
            tag: tag
          };
        } else {
          config.images.airflow = {
            name: image,
            tag: tag
          };
        }

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
}

module.exports = DeploymentService;
