const { SchemaBuilderGuard } = require("@moilandtoil/sealab-schema-builder");

class ConfigGuard extends SchemaBuilderGuard {
  id() {
    return "config_equals";
  }

  validate(context) {
    // allow checking if a config key has...
    // any value
    // a specific value
    // no value
  }
}