const _ = require("lodash");

const BaseService = require("./base.js");

class InviteTokenService extends BaseService {

  async fetchInviteByUuid(inviteUuid, options = { throwError: true }) {
    let invites = await this.model("invite_token")
      .query()
      .findById(inviteUuid);

    if (invites) {
      return invites;
    }
    if (options.throwError) {
      this.resourceNotFound("invite_token", token);
    }
    return null;
  }

  async fetchInviteByToken(token, options = { throwError: true }) {
    let invite = await this.model("invite_token")
      .query()
      .where({ token: token })
      .first();

    if (invite) {
      return invite;
    }

    if (options.throwError) {
      this.resourceNotFound("invite_token", token);
    }
    return null;
  }

  async fetchInvitesByWorkspaceUuid(workspaceUuid = null, email = null, userUuid = null) {
    let payload = {};
    if (workspaceUuid) {
      payload.workspace_uuid = workspaceUuid;
    }

    if (email !== null) {
      payload.email = email;
    }
    if (userUuid !== null) {
      payload.user_uuid = userUuid;
    }

    let invites = await this.model("invite_token")
      .query()
      .where(payload);

    if (invites && invites.length) {
      return invites;
    }
    return [];
  }

  async fetchInvitesByEmail(emails) {
    let invites = await this.model("invite_token")
      .query()
      .whereIn("email", emails);

    if (invites && invites.length) {
      return invites;
    }
    return [];
  }

  // TODO: Add support for creating token for a user in addition the supported functionality of by email
  async createInviteToken(email, workspaceUuid = null, assignments = {}, options = {}) {

    // check if email has already been invited
    if (email) {
      const tokens = await this.service("invite_token").fetchInvitesByEmail([email]);
      const token = _.find(tokens, function (token) {
        return token.workspaceUuid === workspaceUuid;
      });
      if (token) {
        throw new Error("A token has already been created for this email");
      }
    }

    try {
      let invite = await this.model("invite_token")
        .query(options.transaction)
        .insertGraph({
          email: email,
          workspace_uuid: workspaceUuid,
          assignments: assignments,
        }).returning("*");

      if (invite) {
        await this.service("mailer").sendPlatformInvite(email, invite.token);
      }
      return invite;
    } catch (err) {
      this.error(err);
      throw err;
    }
  }

  async acceptInvite(user, invite) {

  }

  async acceptAllInvites(user) {
    const deleteUuids = [];
    let invites = await this.fetchInvitesByEmail(_.map(user.emails, "address"));
    for(let invite of invites) {
      if (invite.workspaceUuid !== null) {

      }
      deleteUuids.push(invite.uuid);
    }
  }

  async deleteInvitesByUuid(uuids) {
    return await this.model("invite_token")
      .query()
      .whereIn("uuid", uuids)
      .delete();
  }

  async deleteInviteToken(inviteToken, options = {}) {
    return await inviteToken.$query(options.transaction).delete();
  }
}

module.exports = InviteTokenService;