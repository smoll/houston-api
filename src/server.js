const { makeExecutableSchema } = require("graphql-tools");
const { GraphQLServer } = require("graphql-yoga");
const Passport = require("passport");

const { Postgres, PostgresMigration } = require("./database/postgres.js");
const { OperationManager } = require("./operations.js");
const Config = require("./utils/config.js");
const Application = require("./application.js");

// Set config defaults
Config.setDefaults({});

// Register connections
Application.registerConnection("postgres", Postgres);


// Register extra types
require("./types/index.js");

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
const server = new GraphQLServer({
  schema: schema,
  context: (req) => { return req.request.context; }
});

const authService = Application.service("auth");
server.express.use(authService.authorizeRequest.bind(authService));

// Build REST routes
require("./routes/index.js")(server.express, Application);

// set auth strategy
const strategy = Config.get(Config.AUTH_STRATEGY);
Passport.use(Application.service("auth").getAuthStrategy(strategy));
server.use(Passport.initialize());

// Prepare migrations
const runMigrations = async function() {
  console.log("Running migrations... ");
  await PostgresMigration();
  console.log("Done");
};

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
    rootValue: {
      schema: schema,
      application: Application,
    }
  }, () => {
    console.log('Server is running on localhost:5001');
  });
}).catch((error) => {
  console.log("Migrations failed, abort starting server");
  console.log(error);
});