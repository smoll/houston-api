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
      releaseName: String
      version: String
      workspace: Workspace
      urls: [DeploymentUrls]
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
        const globalConfig = JSON.parse(Config.get(Config.HELM_GLOBAL_CONFIG));

        // TODO: Add check if user has permission to see it
        if (value.type === "airflow") {
          return [
            {
              type: "airflow",
              url: `https://${value.releaseName}-airflow.${globalConfig["baseDomain"]}/admin`
            },
            {
              type: "flower",
              url: `https://${value.releaseName}-flower.${globalConfig["baseDomain"]}/admin`
            }
          ];
        }
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