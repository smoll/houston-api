const BaseService = require("./base.js");
const nodemailer = require("nodemailer");

const Config = require("../utils/config.js");
class MailerService extends BaseService {
  constructor() {
    super(...arguments);

    //if (Config.isProd()) {
      this.mailer = nodemailer.createTransport(Config.get(Config.SMTP_URI));
    // } else {
    //   console.log("Using local mail transport");
    //   this.mailer = nodemailer.createTransport({
    //     jsonTransport: true
    //   });
    // }
  }

  sendEmail(recipient, subject, text, html = null) {
    const message = {
      from: Config.get(Config.SMTP_FROM),
      to: recipient,
      subject: subject,
      text: text,
    };
    if (html) {
      message.html = html;
    }
    return this.mailer.sendMail(message);
  }

  sendEmailFromTemplate(template, recipients) {

  }

  sendPlatformInvite(recipient) {
    return this.sendEmail(recipient, "Astronomer Invite", "You are invited to the Astronomer Platform")
  }

  sendWorkspaceInvite(recipient, workspace) {
    return this.sendEmail(recipient, "Astronomer Invite", "You have been invited to the workspace");
  }

  sendPasswordReset(recipient, user, token) {
    const textMessage = `A password reset was requested for ${recipient}, please follow the link below to complete the process:
    
    ${Config.orbitDomain(true)}/reset-password?token=${token}`;
    return this.sendEmail(recipient, "Password reset", textMessage);
  }

  sendConfirmation(recipient, token) {
    const textMessage = `Your confirmation token is: ${token}
    
    Please follow the link below to complete the process:
    
    ${Config.orbitDomain(true)}/verify?token=${token}`;

    return this.sendEmail(recipient, "Email verification", textMessage);
  }
}

module.exports = MailerService;