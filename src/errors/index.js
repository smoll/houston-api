const _ = require("lodash");

const AuthError = require("./auth.js");
const GeneralError = require("./general.js");
const InputError = require("./input.js");
const NotFoundError = require("./input.js");

module.exports = {
  AuthError: AuthError,
  InputError: InputError,
  GeneralError: GeneralError,
  NotFoundError: NotFoundError,

  ResourceNotFound: (resource, criteria) => {
    throw new NotFoundError(`${_.pascalCase(resource)} not found that matches "${criteria}"`);
  }
};