const { Model } = require("objection");

// const SoftDelete = require('objection-soft-delete')({
//   columnName: "deleted_at"
// });
const Password = require('objection-password')({
  allowEmptyPassword: true,
  rounds: 10
});

class User extends Password(Model) {

  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["username", "password"],

      properties: {
        uuid: { type: "uuid" },
        username: { type: "string", minLength: 1, maxLength: 255 },
        password: { type: "string", minLength: 1, maxLength: 255 },
        super_admin: { type: "boolean" },
        status: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
        deleted_at: { type: "string" },
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "username", "password", "super_admin", "status", "created_at", "updated_at", "deleted_at"];
  }

  static get namedFilters() {
    return {
      byEmail: (builder) => {
        builder.orderBy('name');
      },
      onlyDogs: (builder) => {
        builder.where('species', 'dog');
      }
    };
  }

  static get relationMappings() {
    return {
      organizations: {
        relation: Model.ManyToManyRelation,
        modelClass: `${__dirname}/Organization`,
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
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/Email`,
        join: {
          from: 'users.uuid',
          to: 'emails.user_uuid'
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

module.exports = User;