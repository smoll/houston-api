const { SchemaBuilderGuard } = require("@moilandtoil/sealab-schema-builder");

class AuthenticatedGuard extends SchemaBuilderGuard {
  id() {
    return "authenticated";
  }

  validate(context) {
    if (!context) {
      return false;
    }
    return context.userId !== null;
  }
}

module.exports = AuthenticatedGuard;