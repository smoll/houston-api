const { SchemaBuilderGuard } = require("@moilandtoil/sealab-schema-builder");

class PermissionGuard extends SchemaBuilderGuard {
  id() {
    return "permission";
  }

  validate(context, extras) {
    for(let permission of extras) {
      if (!context.permissions[permission]) {
        return false;
      }
    }
    return true;
  }
}

module.exports = PermissionGuard;