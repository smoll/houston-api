# Type Docs
This directory contains GraphQL type definitions.
A type is composed of a string typeDef, and a resolver object.

We are using a schemaBuilder to build the entire GraphQL schema,
so these components, along with a name that matches the typeDef name
are added to the schema via a function call.

# Adding GraphQL type
The primary method for the schema builder is `addType`.  It has the signature:

### addType(type, typeDef, resolver)

`type` is a string type, that matches the name of the object in the typeDef

`typeDef` is a string containing the GQL typeDef

`resolver` is an object containing a resolver function for each property of a typeDef


# Example
```
const { SchemaBuilder } = require("./operations.js");

SchemaBuilder.addType('Token',
  `type Token {
    success: Boolean
    message: String
    token: String
    decoded: DecodedToken
  }`,
  {
    success(payload) {
      return payload.success;
    },
    message(payload) {
      return payload.message;
    },
    token(payload) {
      return payload.token;
    },
    decoded(payload) {
      return payload.decoded;
    }
  }
);
```

# Notes:
There is no need to export anything as the data is added via the schema builder