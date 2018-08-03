const { BaseType } = require("sealab");

module.exports = BaseType;

/*
Template:

const BaseType = require("./base.js");

class TypeName extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "TypeName";
    this.typeDef = `
    # Type comments

    type TypeName {
      property: type
    }`;
  },
  resolver() {
    return {
      property(value) {
        return value.property || null;
      },
    };
  }
}

module.exports = TypeName;
 */