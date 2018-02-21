const { OperationManager } = require("@moilandtoil/sealab-operation");

const schemaBuilder = require("./schema.js");
const operationManager = new OperationManager(schemaBuilder);

module.exports = {
  SchemaBuilder: schemaBuilder,
  OperationManager: operationManager
};
