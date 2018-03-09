const BaseService = require("./base.js");

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
    console.log("Query by userUuid");
    // TODO: Once orgs are fully implemented, Query for any deployment in any org user is apart of
    const deployments = await this.model("module_deployment")
      .query()
      .joinEager("creator")
      .whereNull("module_deployments.deleted_at");
    console.log(deployments);
    return deployments
  }

  async createDeployment(title, creator, organization = null, team = null) {
    try {
      const DeploymentModel = this.model("module_deployment");

      // TODO: Plug into commander
      const randomNumber = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
      const releaseName = `release-name-${randomNumber}`;

      const payload = {
        type: DeploymentModel.MODULE_AIRFLOW,
        title: title,
        release_name: releaseName,
        version: "0.1.2",
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
    if (payload["title"] !== undefined && payload.title !== deployment.title) {
      changes.title = payload.title;
    }
    if (payload["team"] !== undefined && payload.team && payload.team.uuid !== deployment.teamUuid) {
      changes.team_uuid = payload.team.uuid;
    }

    if(Object.keys(changes).length === 0) {
      return false;
    }

    await deployment.$query().patch(changes).returning("*");
    return deployment;
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
}

module.exports = DeploymentService;