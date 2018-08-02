const { BaseGuard } = require("sealab");

class PermissionGuard extends BaseGuard {
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