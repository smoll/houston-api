const BaseModel = require("./base.js");

class User extends BaseModel {

  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["username"],

      properties: {
        uuid: { type: "uuid" },
        username: { type: "string", minLength: 1, maxLength: 255 },
        provider_type: { type: "string", minLength: 1, maxLength: 255 },
        provider_uuid: { type: "string", minLength: 1, maxLength: 255 },
        full_name: { type: "string", minLength: 1, maxLength: 255 },
        status: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "username", "provider_type", "provider_uuid", "full_name", "status", "created_at", "updated_at"];
  }

  static get relationMappings() {
    return {
      emails: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/email.js`,
        join: {
          from: 'users.uuid',
          to: 'emails.user_uuid'
        }
      },
      credential: {
        relation: BaseModel.HasOneRelation,
        modelClass: `${__dirname}/local_credential.js`,
        join: {
          from: 'users.provider_id',
          to: 'local_credentials.uuid'
        }
      }
    };
  }

  $beforeInsert(context) {
    this.status = "pending";
    return super.$beforeInsert(context);
  }
}

User.PROVIDER_LOCAL = "local";
User.PROVIDER_BASIC = "basic";
User.PROVIDER_LDAP  = "ldap";

module.exports = User;