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

    const smtpUri = Config.get(Config.SMTP_URI);

    // configure layout plugin
    const templatePath = Path.join(__dirname, "../../data/emails");
    HandlebarsLayouts.register(Handlebars);
    Handlebars.registerPartial('layout', FS.readFileSync(`${templatePath}/layouts/main.hbs`, 'utf8'));

    this.outputEmail = false;

    // determine transport
    let transport = {
      jsonTransport: true
    };
    if (smtpUri) {
      transport = Config.get(Config.SMTP_URI);
    } else {
      this.outputEmail = true;
      this.info("SMTP not configured, no emails will be sent");
    }

    this.mailer = new Emailer({
      views: {
        root: templatePath,
        options: {
          extension: "hbs",
        }
      },
      transport: transport
    });
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
    }).then((email) => {
      if (this.outputEmail) {
        this.info("Warning - SMTP not configured, outputting to console instead:\n");
        this.application.output("====================================================================================================");
        this.application.output(`Subject: ${email.originalMessage.subject}`);
        this.application.output("----------------------------------------------------------------------------------------------------");
        this.application.output(email.originalMessage.text);
        this.application.output("====================================================================================================\n");
      }
      return email;
    });
  }

  async sendPlatformInvite(recipient, token) {
    const companyKey = this.model("system_setting").KEYS_COMPANY_NAME;
    const companyName = await this.service("system_setting").getSetting(companyKey);
    console.log(companyName);

    const payload = {
      token: token,
      orbitUrl: Config.orbitDomain(true),
      company: companyName,
    };
    console.log(payload);
    return this.sendEmailFromTemplate("user_invite", recipient, payload);
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