# Type Docs
This directory contains GraphQL type definitions.
A type is composed of a string typeDef, and a resolver object.

We are using a schemaBuilder to build the entire GraphQL schema,
so these components, along with a name that matches the typeDef name
are added to the schema via a function call.

# Adding GraphQL type
Create a class definition that extends the base type.  It should have a
constructor and resovler method

### constructor(application)

The constructor should set properties for `typeName` and `typeDef`

`typeName` is a string type, that matches the name of the object in the typeDef

`typeDef` is a string containing the GQL typeDef

### resolver
`resolver` should return an object containing a resolver function for
each property of a typeDef.  An application will be dependency injected
into the typeDef, giving the resolver access to all models/services/etc.

# Example
```
const Base = require("./base.js");

class NewType extends Base {
  constructor(application) {
    super(application);
    this.typeName = "NewType";
    this.typeDef = `
      type NewType {
        field1: String
        field2: String
    `;
  }

  resolver() {
    return {
      field1: function(value) {
        return value.field1;
      },
      field2: function(value) {
        return value.field2;
      }
    };
  }
}

export NewType;
```


# Note: When creating a new typedef, ensure to include it via the index.js file
Adding it to the array of exported typeDefs will automatically add it to the list
when the server starts.