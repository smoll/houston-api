const Transaction = require('objection').transaction;

const BaseOperation = require("../base.js");
class CreateTeam extends BaseOperation {
  constructor() {
    super();
    this.name = "createTeam";
    this.typeDef = `
      # Create a team and add authenticated user as owner
      createTeam(label: String!, description: String) : Team
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, context) {
    try {
      // Determine default team groups
      const DEFAULT_GROUPS_KEY = this.model("system_setting").KEY_DEFAULT_TEAM_GROUPS;
      let groupTemplates = await this.service("system_setting").getSetting(DEFAULT_GROUPS_KEY);
      if (groupTemplates && groupTemplates.length > 0) {
        groupTemplates = groupTemplates.split(",");
      } else {
        groupTemplates = [];
      }

      let team = await Transaction(this.conn("postgres"), async (trx) => {
        const payload = {
          label: args.label,
          description: args.description
        };
        const options = {
          transaction: trx
        };

        const team = await this.service("team").createTeam(context.authUser, payload, options);

        await this.service("group").createGroupsFromTemplates(team.uuid, groupTemplates, options);
        return team;
      });

      return await this.service("team").fetchTeamByUuid(team.uuid, {relations: "[users, groups]"});
    } catch(err) {
      this.error(err.message);
      throw err;
    }
  }
}

module.exports = CreateTeam;
