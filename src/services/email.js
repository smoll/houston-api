const BaseService = require("./base.js");
const _ = require("lodash");

const Transaction = require('objection').transaction;

class EmailService extends BaseService {

  async fetchEmailByAddress(address, options = { throwError: true }) {
    let email = await this.model("email")
      .query()
      .findOne("address", address);

    if (email) {
      return email;
    }
    if (options.throwError) {
      this.resourceNotFound("email", address);
    }
    return null;
  }

  async fetchEmailByToken(token, options = { throwError: true }) {
    let email = await this.model("email")
      .query()
      .findOne("token", token);
    if (email) {
      return email;
    }
    if (options.throwError) {
      this.resourceNotFound("email", token);
    }
    return null;
  }


  async updateVerification(email, verified = true) {
    return await email.$query().patch({
      verified: verified
    }).returning("*");
  }

  async resendConfirmation(email) {
    return await Transaction(this.conn("postgres"), async (trx) => {
      email = await email.$query(trx).patch({
        token: email.generateShortId(),
      }).returning("*");

      return await this.service("mailer").sendConfirmation(email.address, email.token);
    });
  }


}

module.exports = EmailService;
