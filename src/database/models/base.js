const { Model } = require("objection");
const ShortId = require("shortid");
const Uuid = require('uuid/v4');

class BaseModel extends Model {

  static get uuidFields() {
    return [];
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
      this[field] = this.generateUuid();
    }
  }
}

module.exports = BaseModel;