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

      properties: {
        uuid: { type: "uuid" },
        username: { type: "string", minLength: 1, maxLength: 255 },
        full_name: { type: "string" },
        status: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
      }
    };
  }

  statusMessage() {
    switch(this.status) {
      case User.STATUS_ACTIVE:
        return "Your account is active";
      case User.STATUS_PENDING:
        return "Your account is awaiting email confirmation";
      case User.STATUS_BANNED:
        return "Your account has been banned";
      case User.STATUS_INACTIVE:
        return "Your account is inactive";
    }
  }

  isActive() {
    return this.status === User.STATUS_ACTIVE;
  }

  isPending() {
    return this.status === User.STATUS_PENDING;
  }

  static get jsonAttributes() {
    return ["uuid", "username", "full_name", "status", "created_at", "updated_at"];
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
      localCredential: {
        relation: BaseModel.HasOneRelation,
        modelClass: `${__dirname}/local_credential.js`,
        join: {
          from: 'users.uuid',
          to: 'local_credentials.user_uuid'
        }
      },
      oauthCredentials: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/oauth_credential.js`,
        join: {
          from: 'users.uuid',
          to: 'oauth_credentials.user_uuid'
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
    if (!this.status) {
      this.status = "pending";
    }
    return super.$beforeInsert(context);
  }
}

User.STATUS_PENDING  = "pending";
User.STATUS_ACTIVE   = "active";
User.STATUS_BANNED   = "banned";
User.STATUS_INACTIVE = "inactive";

User.PROVIDER_LOCAL  = "local";
User.PROVIDER_OAUTH  = "oauth";
User.PROVIDER_LDAP   = "ldap";

module.exports = User;
