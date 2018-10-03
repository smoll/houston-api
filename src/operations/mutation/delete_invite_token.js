const BaseOperation = require("../base.js");

class DeleteInvite extends BaseOperation {
  constructor() {
    super();
    this.name = "deleteInviteToken";
    this.typeDef = `
      # Deletes an invitation
      deleteInviteToken(inviteUuid: Uuid) : Invite
    `;
    this.entrypoint = "mutation";
  }

  async resolver(root, args, { session }) {
    const inviteToken = session.resources.invite;
    await this.service("invite_token").deleteInviteToken(inviteToken);
    return {
      uuid: inviteToken.uuid,
    }
  }
}

module.exports = DeleteInvite;
