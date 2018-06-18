const BaseOperation = require("../base.js");

class CreateTeam extends BaseOperation {
  constructor() {
    super();
    this.name = "addTeamUser";
    this.typeDef = `
      # Create a team and add authenticated user as owner
      addTeamUser(label: String!, description: String!) :
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      let team = await Transaction(this.conn("postgres"), (trx) => {
        const payload = {
          label: args.label,
          description: args.description
        };
        const options = {
          transaction: trx
        };
        return this.service("team").createTeam(context.authUser, payload, options);
      });
      console.log(team);

      return team[0];
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = CreateTeam;
