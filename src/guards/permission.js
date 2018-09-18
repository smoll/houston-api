const { BaseGuard } = require("sealab");

class PermissionGuard extends BaseGuard {
  id() {
    return "permission";
  }

  validate(context, extras) {
    return context.session.hasPermissions(extras.map((item) => {
      if (~item.indexOf("|")) {
        return item.split("|");
      } else {
        return item;
      }
    }));
  }
}

module.exports = PermissionGuard;