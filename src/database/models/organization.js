const { Model } = require("objection");

const SoftDelete = require('objection-soft-delete')({
  columnName: "deleted_at"
});

class Organization extends SoftDelete(Model) {
  static get tableName() {
    return "organizations";
  }

  static get idColumn() {
    return "uuid";
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
        relation: Model.ManyToManyRelation,
        modelClass: `${__dirname}/User`,
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
    this.plan = "none";
    this.enabled = true;
    return super.$beforeInsert(context);
  }

}

module.exports = Organization;