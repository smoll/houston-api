const FS = require("fs");
const BaseService = require("./base.js");
const Emailer = require('email-templates');
const Path = require("path");
const Handlebars = require("handlebars");
const HandlebarsLayouts = require("handlebars-layouts");

const Config = require("../utils/config.js");
class MailerService extends BaseService {
  constructor() {
    super(...arguments);

    const templatePath = Path.join(__dirname, "../../data/emails");
    HandlebarsLayouts.register(Handlebars);

    Handlebars.registerPartial('layout', FS.readFileSync(`${templatePath}/layouts/main.hbs`, 'utf8'));
    //if (Config.isProd()) {

    this.mailer = new Emailer({
      views: {
        root: templatePath,
        options: {
          extension: "hbs",
        }
      },
      // uncomment below to send emails in development/test env:
      // send: true
      transport: Config.get(Config.SMTP_URI)
    });


    // } else {
    //   console.log("Using local mail transport");
    //   this.mailer = nodemailer.createTransport({
    //     jsonTransport: true
    //   });
    // }
  }

  async sendEmail(recipient, subject, text, html = null) {
    const replyEmailKey = this.model("system_setting").KEYS_REPLY_EMAIL;
    const replyEmail = await this.service("system_setting").getSetting(replyEmailKey);

    const message = {
      from: replyEmail,
      to: recipient,
      subject: subject,
      text: text,
    };

    if (html) {
      message.html = html;
    }
    return this.mailer.send({
      message: message
    });
  }

  async sendEmailFromTemplate(template, recipient, payload) {
    const replyEmailKey = this.model("system_setting").KEYS_REPLY_EMAIL;
    const replyEmail = await this.service("system_setting").getSetting(replyEmailKey);

    const message = {
      from: replyEmail,
      to: recipient,
    };

    return this.mailer.send({
      template: template,
      message: message,
      locals: payload,
    });
  }

  sendPlatformInvite(recipient) {
    return this.sendEmail(recipient, "Astronomer Invite", "You are invited to the Astronomer Platform")
  }

  sendWorkspaceInvite(recipient, workspace) {
    return this.sendEmail(recipient, "Astronomer Invite", "You have been invited to the workspace");
  }

  async sendPasswordReset(recipient, user, token) {
    const companyKey = this.model("system_setting").KEYS_COMPANY_NAME;
    const companyName = await this.service("system_setting").getSetting(companyKey);

    return await this.sendEmailFromTemplate("forgot_password", recipient, {
      token: token,
      orbitUrl: Config.orbitDomain(true),
      company: companyName,
    });
  }

  async sendConfirmation(recipient, token) {
    const companyKey = this.model("system_setting").KEYS_COMPANY_NAME;
    const companyName = await this.service("system_setting").getSetting(companyKey);

    return await this.sendEmailFromTemplate("confirm_email", recipient, {
      token: token,
      orbitUrl: Config.orbitDomain(true),
      company: companyName,
    });
  }
}

module.exports = MailerService;