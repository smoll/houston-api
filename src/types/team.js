const BaseType = require("./base.js");

class Team extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "Team";
    this.typeDef = `
    type Team {
      uuid: Uuid
      label: String
      description: String
      active: Boolean
      createdAt: String
      updatedAt: String
    }`;
  }

  resolver() {
    return {
      uuid(value) {
        return value.uuid || null;
      },
      label(value) {
        return value.label || false;
      },
      description(value) {
        return value.description || null;
      },
      active(value) {
        return value.active === true
      },
      // users(value) {
      //   return value.users || [];
      // },
      createdAt(value) {
        return value.createdAt || null;
      },
      updatedAt(value) {
        return value.updatedAt || null;
      },
    };
  }
}

module.exports = Team;