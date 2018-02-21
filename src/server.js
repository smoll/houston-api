const { makeExecutableSchema } = require("graphql-tools");
const { GraphQLServer } = require("graphql-yoga");

const { Postgres, PostgresMigration } = require("./database/postgres.js");
const Config = require("./utils/config.js");
const Application = require("./application.js");
const { OperationManager } = require("./operations.js");

// Set config defaults
Config.setDefaults({});

// Register connections
Application.registerConnection("postgres", Postgres);

// Prepare migrations
const runMigrations = async function() {
  console.log("Running migrations... ");
  await PostgresMigration();
  console.log("Done");
};

// Register extra types
require("./types.js");

// Register operations
const operations = require("./operations/index.js");
for(let operation of operations) {
  OperationManager.registerOperation(operation, Application);
}

// Create the schema
const schema = makeExecutableSchema({
  typeDefs: OperationManager.schemaBuilder.generateTypeDefs(),
  resolvers: OperationManager.schemaBuilder.generateResolvers()
});

// Start the server
const server = new GraphQLServer({ schema });

runMigrations().then(() => {
  server.start({
    cors: {
      origin: true
    },
    port: Config.get(Config.PORT),
    endpoint: Config.get(Config.API_ENDPOINT_URL),
    subscriptions: Config.get(Config.WEBSOCKET_ENDPOINT_URL),
    playground: Config.get(Config.PLAYGROUND_ENDPOINT_URL),
    uploads: {},
  }, () => {
    console.log('Server is running on localhost:5001');
  });
}).catch((error) => {
  console.log("Migrations failed, abort starting server");
  console.log(error);
});