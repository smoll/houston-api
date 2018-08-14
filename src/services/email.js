const BaseService = require("./base.js");
const _ = require("lodash");

const Transaction = require('objection').transaction;

class EmailService extends BaseService {

  async fetchEmailByAddress(address, throwError = true) {
    let email = await this.model("email")
      .query()
      .findOne("address", address);

    if (email) {
      return email;
    }
    if (throwError) {
      this.notFound("email", address);
    }
    return null;
  }

  async updateVerification(email, verified = true) {
    return await email.$query().patch({
      token: "",
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
