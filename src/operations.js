const { OperationManager } = require("@moilandtoil/sealab-operation");
const { SchemaBuilder } = require("@moilandtoil/sealab-schema-builder");
const { TypeManager } = require("@moilandtoil/sealab-type");


const schemaBuilder = new SchemaBuilder();
const operationManager = new OperationManager(schemaBuilder);
const typeManager = new TypeManager(schemaBuilder);

module.exports = {
  OperationManager: operationManager,
  SchemaBuilder: schemaBuilder,
  TypeManager: typeManager,
};
