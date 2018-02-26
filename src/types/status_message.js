const { SchemaBuilder } = require("../operations.js");

SchemaBuilder.addType('StatusMessage',
  `# Response to most mutations, will always give a boolean success and message describing end result of the mutation
  type StatusMessage {
     #Did it work?
    success: Boolean
     #Houston provided human-friendly messages
    message: String
     #Returns the id of whatever was affected by the mutation
    id: String
    code: String
  }`,
  {
    success(value) {
      return value.success;
    },
    message(value) {
      return value.message;
    },
    id(value) {
      return value.id;
    },
    code(value) {
      return value.code;
    }
  }
);