const BaseModel = require("./base.js");
const CommonUtil = require("../../utils/common.js");

class Email extends BaseModel {

  static get tableName() {
    return "emails";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["address", "user_uuid"],

      properties: {
        uuid: { type: "uuid" },
        address: { type: "string", minLength: 1, maxLength: 255 },
        user_uuid: { type: "uuid" },
        token: { type: "string" },
        main: { type: "boolean" },
        verified: { type: "boolean" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "address", "user_uuid", "token", "main", "verified"];
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'emails.user_uuid',
          to: 'users.uuid'
        }
      }
    };
  }

  $beforeInsert(context) {
    return CommonUtil.randomToken(20).then((token) => {
      this.token = token;
      this.main = false;
      this.verified = false;
      return super.$beforeInsert(context);
    });
  }
}

module.exports = Email;