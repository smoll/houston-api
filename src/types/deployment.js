const BaseType = require("./base.js");

class Deployment extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "Deployment";
    this.typeDef = `
    type Deployment {
      uuid: Uuid
      type: String
      label: String
      release_name: String
      version: String
      team: Team
      created_at: String
      updated_at: String
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
      release_name(value) {
        return value.releaseName || null;
      },
      version(value) {
        return value.version || null;
      },
      team(value) {
        return value || {};
      },
      created_at(value) {
        return value.createdAt || null;
      },
      updated_at(value) {
        return value.updatedAt || null;
      },
    };
  }
}

module.exports = Deployment;