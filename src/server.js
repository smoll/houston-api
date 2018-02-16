"use strict";

const { makeExecutableSchema } = require("graphql-tools");
const { GraphQLServer } = require("graphql-yoga");

const Config = require("./utils/config.js");

const typeDefs = `
  type Query {
   # Responds "alive" if the API is available
    healthcheck: String!
  }
`;

const resolvers = {
  Query: {
    healthcheck: (root, args, context) => {
      return "alive"
    }
  }
};

const config = new Config();
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
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
