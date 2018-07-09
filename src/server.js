const { makeExecutableSchema } = require("graphql-tools");
const { GraphQLServer } = require("graphql-yoga");
const BodyParser = require("body-parser");
const ApolloError = require("apollo-errors").formatError;
const Config = require("./utils/config.js");

// Set config defaults
Config.setDefaults({});

const { Postgres, Airflow, PostgresMigration } = require("./database/postgres.js");
const { OperationManager, TypeManager, SchemaBuilder } = require("./operations.js");

const Application = require("./application.js");

// Register connections
Application.registerConnection("postgres", Postgres);
Application.registerConnection("airflow", Airflow);

const types = require("./types/index.js");
const operations = require("./operations/index.js");
const guards = require("./guards/index.js");

// Register types & operations
TypeManager.registerTypes(types, Application);
OperationManager.registerOperations(operations, Application);
SchemaBuilder.registerGuards(guards);

// Create the schema
const schema = makeExecutableSchema({
  typeDefs: SchemaBuilder.generateTypeDefs({}, []),
  resolvers: SchemaBuilder.generateResolvers({}, [])
});

// Start the server
const server = new GraphQLServer({
  schema: schema,
  context: (req) => { return req.request.context; }
});

const authService = Application.service("auth");
const commonService = Application.service("common");
server.express.use(authService.authorizeRequest.bind(authService));

OperationManager.registerPreHook(async function(root, args, context, operation) {
  context.resources = await commonService.resourceResolver(args);
  return Promise.resolve([root, args, context, operation]);
});

// Build REST routes
server.express.use(BodyParser.json({
  type: ["application/json", "application/vnd.docker.distribution.events.v1+json"]
}));
require("./routes/index.js")(server.express, Application);

(async function() {
  Application.logger().info("Running migrations... ");
  await PostgresMigration();
  Application.logger().info("Done");
})().then(() => {
  server.start({
    // cors config options https://github.com/expressjs/cors#configuration-options
    cors: {
      origin: [new RegExp(`.${Config.baseDomain()}$`)],
      methods: "GET,PUT,POST,DELETE,OPTIONS",
      allowedHeaders: "Content-Type, Authorization, Content-Length, X-Requested-With",
      credentials: true,
    },
    port: Config.get(Config.PORT),
    endpoint: Config.get(Config.API_ENDPOINT_URL),
    subscriptions: Config.get(Config.WEBSOCKET_ENDPOINT_URL),
    playground: Config.get(Config.PLAYGROUND_ENDPOINT_URL),
    uploads: {},
    rootValue: {
      schema: schema,
      application: Application,
    },
    formatError: ApolloError
  });
}).catch((error) => {
  Application.logger().error("Migrations failed, abort starting server");
  console.log(error);
  Application.logger().error(error);
});
