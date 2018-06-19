const BaseOperation = require("../base.js");

class CreateOauthUser extends BaseOperation {
  constructor() {
    super();
    this.name = "createUser";
    this.typeDef = `
      # Creates a new user from an OAuth code
      createUser(provider: String!) : Token
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {

  }
}

module.exports = CreateOauthUser;
