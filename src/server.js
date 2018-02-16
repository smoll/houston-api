"use strict";

const { makeExecutableSchema } = require("graphql-tools");
const { GraphQLServer } = require("graphql-yoga");

const Config = require("./utils/config.js");

const Application = require("./application.js");
const OperationManager = require("./operations.js");

const operations = require("./operations/index.js");

for(let operation of operations) {
  OperationManager.registerOperation(operation, Application);
}

const config = new Config();
const schema = makeExecutableSchema({
  typeDefs: OperationManager.schemaBuilder.generateTypeDefs(),
  resolvers: OperationManager.schemaBuilder.generateResolvers()
});


const server = new GraphQLServer({ schema });
server.start({
  cors: {
    origin: true
  },
  port: config.get(Config.PORT),
  endpoint: '/v1/',
  subscriptions: '/ws',
  playground: '/playground',
  uploads: {},
}, () => {
  console.log('Server is running on localhost:5001');
});
