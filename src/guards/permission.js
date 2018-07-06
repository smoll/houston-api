const { SchemaBuilderGuard } = require("@moilandtoil/sealab-schema-builder");

class PermissionGuard extends SchemaBuilderGuard {
  id() {
    return "permission";
  }

  validate(context, extras) {
    for(let permission of extras) {
      const payload = this.parsePermission(permission);
      if (!context.permissions[payload.group]) {
        return false;
      }
      if (!context.permissions[payload.group][payload.permission]) {
        return false;
      }
    }
    return true;
  }

  parsePermission(permission) {
    const pos = permission.indexOf("_");
    const group = permission.substr(0, pos);
    const perm = permission.substr(pos + 1);
    return {
      group: group,
      permission: perm
    };
  }
}

module.exports = PermissionGuard;