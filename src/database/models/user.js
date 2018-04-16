const BaseModel = require("./base.js");

// const SoftDelete = require('objection-soft-delete')({
//   columnName: "deleted_at"
// });
const Password = require('objection-password')({
  allowEmptyPassword: true,
  rounds: 10
});

class User extends Password(BaseModel) {

  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "uuid";
  }

  static get uuidFields() {
    return ['uuid'];
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["username", "provider_type", "provider_id"],

      properties: {
        uuid: { type: "uuid" },
        username: { type: "string", minLength: 1, maxLength: 255 },
        provider_type: { type: "string", minLength: 1, maxLength: 255 },
        provider_id: { type: "string", minLength: 1, maxLength: 255 },
        full_name: { type: "string", minLength: 1, maxLength: 255 },
        super_admin: { type: "boolean" },
        status: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
        deleted_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "username", "provider_type", "provider_id", "full_name", "super_admin", "status", "created_at", "updated_at", "deleted_at"];
  }

  static get relationMappings() {
    return {
      organizations: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: `${__dirname}/organization.js`,
        join: {
          from: 'users.uuid',
          through: {
            from: 'organization_users.user_uuid',
            to: 'organization_users.organization_uuid'
          },
          to: 'organizations.uuid'
        }
      },
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
    this.superAdmin = false;
    return super.$beforeInsert(context);
  }
}

User.PROVIDER_LOCAL= "local";
User.PROVIDER_LDAP = "ldap";

module.exports = User;