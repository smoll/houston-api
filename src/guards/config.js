const { BaseGuard } = require("sealab");

class ConfigGuard extends BaseGuard {
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