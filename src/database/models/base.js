const { Model } = require("objection");
const ShortId = require("shortid");
const Uuid = require('uuid/v4');

class BaseModel extends Model {

  static get uuidFields() {
    return ["uuid"];
  }

  static get autoDate() {
    return true;
  }

  generateUuid() {
    return Uuid();
  }

  generateShortId() {
    return ShortId.generate();
  }

  $beforeInsert(context) {
    super.$beforeInsert(context);

    for(let field of this.constructor.uuidFields) {
      // ensure field is in jsonSchema definition before creating it
      if (!this.constructor.jsonSchema || !this.constructor.jsonSchema.properties[field]) {
        continue;
      }

      this[field] = this.generateUuid();
    }

    if (this.constructor.autoDate) {
      this.createdAt = new Date().toISOString();
    }
  }

  $beforeUpdate(context) {
    super.$beforeUpdate(context);

    if (this.constructor.autoDate) {
      this.updatedAt = new Date().toISOString();
    }
  }
}

module.exports = BaseModel;