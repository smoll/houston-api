const { makeExecutableSchema } = require("graphql-tools");
const { GraphQLServer, PubSub } = require("graphql-yoga");
const ConstraintDirective = require('graphql-constraint-directive')
const BodyParser = require("body-parser");
const ApolloError = require("apollo-errors").formatError;
const Config = require("./utils/config.js");

// Set config defaults
Config.setDefaults({});

const { Postgres, Airflow, PostgresMigration } = require("./database/postgres.js");
const { OperationManager, TypeManager, SchemaBuilder } = require("./operations.js");

const Application = require("./application.js");
const pubsub = new PubSub();

// Register connections
Application.registerConnection("postgres", Postgres);
Application.registerConnection("airflow", Airflow);

// Attach pubsub
Application.registerPubSub(pubsub);

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
  resolvers: SchemaBuilder.generateResolvers({}, []),
  schemaDirectives: { constraint: ConstraintDirective }
});

(async function() {
  Application.logger().info("Running migrations... ");
  await PostgresMigration();
  Application.logger().info("Done");
})().then(() => {

  // Start the server
  const server = new GraphQLServer({
    schema: schema,
    context: (req) => {
      if (req.request) {
        return req.request.context;
      } else if(req.connection) {
        return req.connection.context;
      }
    }
  });
  server.express.use(Config.get(Config.API_ENDPOINT_URL), (req, res, next) => {
    // Handle express route authorization
    let authorization = req.headers.authorization;
    req.context = {
      req: req,
      res: res,
    };
    Application.service("auth").authenticateRequest(authorization).then((session) => {
      session.origin = req.headers.origin;
      req.context.session = session;

      return next();
    }).catch((err) => {
      Application.output(`Error determining request authorization: ${err.message}`);
      return res.status(500).send('Unable to process request');
    })
  });

  OperationManager.registerPreHook(async function(root, args, context, info, operation) {
    context.session.resources = await Application.service("common").resourceResolver(args);
    await Application.service("common").resolveRequesterPermissions(context.session);
    return Promise.resolve([root, args, context, info, operation]);
  });

// Build REST routes
  server.express.use(BodyParser.json({
    type: ["application/json", "application/vnd.docker.distribution.events.v1+json"]
  }), BodyParser.urlencoded({ extended: false }));
  require("./routes/index.js")(server.express, Application);


  return server.start({
    // cors config options https://github.com/expressjs/cors#configuration-options
    cors: {
      origin: [new RegExp(`.${Config.baseDomain()}$`)],
      methods: "GET,PUT,POST,DELETE,OPTIONS",
      allowedHeaders: "Content-Type, Authorization, Content-Length, X-Requested-With",
      credentials: true,
    },
    port: Config.get(Config.PORT),
    endpoint: Config.get(Config.API_ENDPOINT_URL),
    subscriptions: {
      path: Config.get(Config.WEBSOCKET_ENDPOINT_URL),
      onConnect: function(connParams, websocket, context) {
        // Handle websocket authorization
        return Application.service("auth").authenticateRequest(connParams.authorization).then((session) => {
          return { session: session };
        });
      }
    },
    playground: Config.get(Config.PLAYGROUND_ENDPOINT_URL),
    uploads: {},
    rootValue: {
      schema: schema,
      application: Application,
    },
    formatError: ApolloError
  });
}).catch((err) => {
  Application.logger().error("Migrations failed, abort starting server");
  Application.output(err);
  Application.logger().error(err);
});
