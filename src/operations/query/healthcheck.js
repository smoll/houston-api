"use strict";

const { BaseOperation } = require("@moilandtoil/sealab-operation");

class HealthCheck extends BaseOperation {
  constructor() {
    super();
    this.name = "healthcheck";
    this.typeDef = `
      # Responds "alive" if the API is available
      healthcheck: String!
    `;
    this.entrypoint = "query";
  }

  resolver() {
    return "alive"
  }
}

module.exports = HealthCheck;