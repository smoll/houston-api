const { makeExecutableSchema } = require("graphql-tools");
const { GraphQLServer } = require("graphql-yoga");
const BodyParser = require("body-parser");

const Config = require("./utils/config.js");
// Set config defaults
Config.setDefaults({});

const Passport = require("passport");

const { Postgres, Airflow, PostgresMigration } = require("./database/postgres.js");
const { OperationManager, TypeManager } = require("./operations.js");

const Application = require("./application.js");

// Register connections
Application.registerConnection("postgres", Postgres);
Application.registerConnection("airflow", Airflow);

const types = require("./types/index.js");
const operations = require("./operations/index.js");

// Register types & operations
TypeManager.registerTypes(types, Application);
OperationManager.registerOperations(operations, Application);

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
server.express.use(BodyParser.json({
  type: ["application/json", "application/vnd.docker.distribution.events.v1+json"]
}));
require("./routes/index.js")(server.express, Application);

// set auth strategy
const strategy = Config.get(Config.AUTH_STRATEGY);
Passport.use(Application.service("auth").getAuthStrategy(strategy));
server.use(Passport.initialize());

(async function() {
  console.log("Running migrations... ");
  await PostgresMigration();
  console.log("Done");
})().then(() => {
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
  });
}).catch((error) => {
  console.log("Migrations failed, abort starting server");
  console.log(error);
});