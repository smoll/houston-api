const { BaseGuard } = require("sealab");

class AuthenticatedGuard extends BaseGuard {
  id() {
    return "authenticated";
  }

  validate(context) {
    if (!context || !context.session) {
      return false;
    }
    if (!context.session.token.valid) {
      return false;
    }
    if (context.session.token.expired) {
      return false;
    }
    return context.session.authUser !== null;
  }
}

module.exports = AuthenticatedGuard;