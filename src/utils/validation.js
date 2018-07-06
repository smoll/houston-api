const { InputInvalid } = require("../errors/index.js");

module.exports = {
  alpha(string, operation, field) {
    if (string.match(/^[a-zA-Z0-9]+$/) === null) {
      throw InputInvalid(operation, field, "alphanumeric");
    }
  },

  alphaNum(string, operation, field) {
    if (string.match(/^[a-zA-Z0-9]+$/) === null) {
      throw InputInvalid(operation, field, "alphanumeric");
    }
  },

  alphaNumSpecial(string, operation, field) {
    if (string.match(/^[a-zA-Z0-9\s\'\"!@#\$%\^&\*\(\)\-\+_={\}\[\]\\\|\\/.,:;]+$/) === null) {
      throw InputInvalid(operation, field, "alphanumeric, special characters");
    }
  }
};
