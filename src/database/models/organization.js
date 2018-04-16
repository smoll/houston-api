const BaseModel = require("./base.js");

const SoftDelete = require('objection-soft-delete')({
  columnName: "deleted_at"
});

class Organization extends SoftDelete(BaseModel) {
  static get tableName() {
    return "organizations";
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
      required: ["title", "description"],

      properties: {
        uuid: { type: "uuid" },
        title: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: "string", minLength: 1, maxLength: 255 },
        plan: { type: "string", minLength: 1, maxLength: 255 },
        enabled: { type: "boolean" }
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "title", "description", "plan", "enabled", "created_at", "updated_at", "deleted_at"];
  }

  static get relationMappings() {
    return {
      users: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: `${__dirname}/user.js`,
        join: {
          from: 'organizations.uuid',
          through: {
            from: 'organization_users.organization_uuid',
            to: 'organization_users.user_uuid'
          },
          to: 'users.uuid'
        }
      }
    };
  }

  $beforeInsert(context) {
    this.plan = Organization.PLAN_NONE;
    this.enabled = true;
    return super.$beforeInsert(context);
  }
}

Organization.PLAN_NONE = "none";

module.exports = Organization;