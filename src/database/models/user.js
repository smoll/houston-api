const BaseModel = require("./base.js");

class User extends BaseModel {

  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "uuid";
  }

  static get defaultEager () {
    return 'emails'
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
        full_name: { type: "string" },
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
      properties: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/user_property.js`,
        join: {
          from: 'users.uuid',
          to: 'user_properties.user_uuid'
        }
      },
      credential: {
        relation: BaseModel.HasOneRelation,
        modelClass: `${__dirname}/local_credential.js`,
        join: {
          from: 'users.provider_uuid',
          to: 'local_credentials.uuid'
        }
      },
      workspaces: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: `${__dirname}/workspace.js`,
        join: {
          from: 'users.uuid',
          to: 'workspaces.uuid',
          through: {
            model: `${__dirname}/user_workspace_map.js`,
            from: `user_workspace_map.user_uuid`,
            to: `user_workspace_map.workspace_uuid`
          },
        }
      },
      groups: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: `${__dirname}/group.js`,
        join: {
          from: 'users.uuid',
          to: 'groups.uuid',
          through: {
            model: `${__dirname}/user_group_map.js`,
            from: `user_group_map.user_uuid`,
            to: `user_group_map.group_uuid`
          },
        }
      },
    };
  }

  $beforeInsert(context) {
    this.status = "pending";
    return super.$beforeInsert(context);
  }
}

User.PROVIDER_LOCAL = "local";
User.PROVIDER_OAUTH = "oauth";
User.PROVIDER_LDAP  = "ldap";

module.exports = User;