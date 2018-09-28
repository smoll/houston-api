const _ = require("lodash");

const BaseType = require("./base.js");
const Session = require("../session.js");

class Permissions extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "Permissions";

    const session = new Session();

    let typeDef = [];
    this.resolvers = {};

    for(let permission in session.permissions) {
      if (!session.permissions.hasOwnProperty(permission)) {
        continue;
      }
      const permissionName = _.camelCase(permission);
      typeDef.push(`${permissionName}: String`);
      this.resolvers[permissionName] = function(value) {
        return value[permission];
      }
    }

    this.typeDef = `
    type Permissions {
      ${typeDef.join("\n")}
    }`;
  }

  resolver() {
    return this.resolvers
  }
}

module.exports = Permissions;