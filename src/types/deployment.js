const BaseType = require("./base.js");
const Config = require("../utils/config.js");

class Deployment extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "Deployment";
    this.typeDef = `
    type Deployment {
      uuid: Uuid
      type: String
      label: String
      description: String
      releaseName: String
      version: String
      workspace: Workspace
      urls: [DeploymentUrls]
      deployInfo: DeployInfo
      createdAt: String
      updatedAt: String
    }`;
  }

  resolver() {
    return {
      uuid(value) {
        return value.uuid || null;
      },
      type(value) {
        return value.type || null;
      },
      label(value) {
        return value.label || null;
      },
      description(value) {
        return value.description || null;
      },
      releaseName(value) {
        return value.releaseName || null;
      },
      version(value) {
        return value.version || null;
      },
      workspace(value) {
        return value.workspace || {};
      },
      urls(value, root, context) {
        // TODO: Add check if user has permission to see it
        if (value.type === "airflow") {
          return [
            {
              type: "airflow",
              url: `https://${value.releaseName}-airflow.${Config.baseDomain()}/admin`
            },
            {
              type: "flower",
              url: `https://${value.releaseName}-flower.${Config.baseDomain()}`
            }
          ];
        }
      },
      deployInfo(value) {
        return this.service("docker").fetchImagesByDeployment(value);
      },
      createdAt(value) {
        return value.createdAt || null;
      },
      updatedAt(value) {
        return value.updatedAt || null;
      },
    };
  }
}

module.exports = Deployment;
