const { SchemaBuilder } = require("../operations.js");

SchemaBuilder.addType('User',
  `# Astronomer user object
  type User {
    id: ID
    emails: [Email]
    profile: JSON
    username: String
    status: String
  }`,
  {
    id(value) {
      return value.uuid;
    },
    emails(value) {
      return value.emails;
    },
    profile(value) {
      return value.profile;
    },
    username(value) {
      return value.username;
    },
    status(value) {
      return value.status;
    }
  }
);