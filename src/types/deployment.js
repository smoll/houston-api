const { SchemaBuilder } = require("../operations.js");

SchemaBuilder.addType('Deployment',
  `# Astronomer deployment object
  type Deployment {
    uuid: ID
    type: String
    title: String
    release_name: String
    version: String
    creator: User
    organization: Organization
    team: Team
  }`,
  {
    uuid(value) {
      return value.uuid;
    },
    type(value) {
      return value.type;
    },
    title(value) {
      return value.title;
    },
    release_name(value) {
      return value.releaseName;
    },
    version(value) {
      return value.version;
    },
    creator(value) {
      return value.creator;
    },
    organization(value) {
      return value;
    },
    team(value) {
      return value;
    },
  }
);