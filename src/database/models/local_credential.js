const { Model } = require("objection");

const Password = require('objection-password')({
  allowEmptyPassword: true,
  rounds: 10
});

class LocalCredential extends Password(Model) {

  static get tableName() {
    return "local_credentials";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["password"],

      properties: {
        uuid: { type: "uuid" },
        password: { type: "string", minLength: 1, maxLength: 255 },
        created_at: { type: "string" },
        updated_at: { type: "string" },
        deleted_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "password", "created_at", "updated_at", "deleted_at"];
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/User`,
        filter: {
          provider: "local"
        },
        beforeInsert(model) {
          model.provider = 'local';
        },
        join: {
          from: 'local_credentials.uuid',
          to: 'users.provider_id'
        }
      }
    };
  }
}

module.exports = LocalCredential;