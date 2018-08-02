const { OperationManager } = require("sealab");
const { SchemaBuilder } = require("sealab");
const { TypeManager } = require("sealab");

const schemaBuilder = new SchemaBuilder();
const operationManager = new OperationManager(schemaBuilder);
const typeManager = new TypeManager(schemaBuilder);

module.exports = {
  OperationManager: operationManager,
  SchemaBuilder: schemaBuilder,
  TypeManager: typeManager,
};
