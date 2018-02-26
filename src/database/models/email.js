const { Model } = require("objection");
const CommonUtil = require("../../utils/common.js");

const SoftDelete = require('objection-soft-delete')({
  columnName: "deleted_at"
});

class Email extends SoftDelete(Model) {

  static get tableName() {
    return "emails";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["address", "user_uuid"],

      properties: {
        id: { type: "int" },
        address: { type: "string", minLength: 1, maxLength: 255 },
        user_uuid: { type: "uuid" },
        token: { type: "string" },
        main: { type: "true" },
        verified: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["id", "address", "user_uuid", "token", "main", "verified"];
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
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