const BaseType = require("./base.js");

class ServiceAccount extends BaseType {
  constructor(application) {
    super(application);
    this.typeName = "ServiceAccount";
    this.typeDef = `
    type ServiceAccount {
      uuid: Uuid
      apiKey: String
      label: String
      category: String
      entityType: EntityType
      entityUuid: Uuid
      active: Boolean
      createdAt: String
      updatedAt: String
    }`;
  }

  resolver() {
    return {
      uuid(value) {
        return value.uuid || null;
      },
      apiKey(value) {
        return value.apiKey || null;
      },
      label(value) {
        return value.label || null;
      },
      category(value) {
        return value.category || null;
      },
      entityType(value) {
        return value.entityType || null;
      },
      entityUuid(value) {
        return value.entityUuid || null;
      },
      active(value) {
        return value.active === true
      },
      createdAt(value) {
        return value.createdAt || null;
      },
      updatedAt(value) {
        return value.updatedAt || null;
      },
    };
  }
}

module.exports = ServiceAccount;