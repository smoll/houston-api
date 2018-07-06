const { SchemaBuilderGuard } = require("@moilandtoil/sealab-schema-builder");

class AuthenticatedGuard extends SchemaBuilderGuard {
  id() {
    return "authenticated";
  }

  validate(context) {
    if (!context) {
      return false;
    }
    if (!context.token.valid) {
      return false;
    }
    if (context.token.expired) {
      return false;
    }
    return context.authUser !== null;
  }
}

module.exports = AuthenticatedGuard;