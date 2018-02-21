const { Model } = require("objection");
const SoftDelete = require('objection-soft-delete')({
  columnName: "deleted_at"
});

class ModuleDeployment extends SoftDelete(Model) {

  static get tableName() {
    return "module_deployments";
  }

  static get idColumn() {
    return "uuid";
  }

  static get jsonSchema () {
    return {
      type: "object",
      required: ["uuid", "type", "title", "release_name", "version", "creator_uuid", "organization_uuid"],

      properties: {
        uuid: { type: "string" },
        type: { type: "string"},
        title: { type: "string", minLength: 1, maxLength: 255 },
        release_name: { type: "string", minLength: 1, maxLength: 128 },
        version: { type: "string" },
        creator_uuid: { type: "string" },
        organization_uuid: { type: "string" },
        team_uuid: { type: ["string", "null"] }
      }
    };
  }

  static get jsonAttributes() {
    return ["uuid", "type", "title", "release_name", "version", "creator_uuid", "team_uuid", "created_at", "updated_at"];
  }

  static get relationMappings() {


    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/User`,
        join: {
          from: 'module_deployments.creator_uuid',
          to: 'users.uuid'
        }
      },

      movies: {
        relation: Model.ManyToManyRelation,
        // Solution 3:
        //
        // Use only a module name and define a `modelPaths` property for your model (or a superclass
        // of your model). Search for `modelPaths` from the docs for more info.
        modelClass: 'Movie',
        join: {
          from: 'Person.id',
          through: {
            from: 'Person_Movie.personId',
            to: 'Person_Movie.movieId'
          },
          to: 'Movie.id'
        }
      }
    };
  }
}

module.exports = ModuleDeployment;