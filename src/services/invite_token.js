const BaseService = require("./base.js");

class InviteTokenService extends BaseService {

  async fetchInviteByUuid(inviteUuid, throwError = true) {
    let invites = await this.model("invite_token")
      .query()
      .findById(inviteUuid);

    if (invites) {
      return invites;
    }
    if (throwError) {
      this.notFound("invite_token", token);
    }
    return null;
  }

  async fetchInviteByToken(token, throwError = true) {
    let invites = await this.model("invite_token")
      .query()
      .where({ token: token });

    if (invites) {
      return invites;
    }
    if (throwError) {
      this.notFound("invite_token", token);
    }
    return null;
  }

  async fetchInvitesByWorkspaceUuid(workspaceUuid, email = null) {
    let payload = {
      workspace_uuid: workspaceUuid
    };
    if (email !== null) {
      payload.email = email;
    }

    let invites = await this.model("invite_token")
      .query()
      .where(payload);

    if (invites && invites.length) {
      return invites;
    }
    return [];
  }

  async createInviteToken(email, workspaceUuid, assignments = {}) {
    try {
      let invite = await this.model("invite_token")
        .query()
        .insertGraph({
          email: email,
          workspace_uuid: workspaceUuid,
          assignments: assignments,
        }).returning("*");
      return invite;
    } catch (err) {
      this.error(err);
      throw err;
    }

  }

  async deleteInviteToken(inviteToken) {
    return await inviteToken.$query().delete();
  }
}

module.exports = InviteTokenService;