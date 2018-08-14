const createError = require('apollo-errors').createError;
const _ = require("lodash");

const AuthExpiredError = createError('AuthExpiredError', {
  message: 'Your authorization token has expired, please login again'
});

const UnauthorizedError = createError('AuthError', {
  message: 'You are not authorized to do this action'
});

const InputInvalidError = createError('InputValidationError', {
  message: 'Input validation failed'
});

const ResourceNotFound = createError('ResourceNotFoundError', {
  message: 'Resource was not found'
});

const UserNotFound = createError('UserNotFoundError', {
  message: 'User was not found'
});

const GenericError = createError('GenericError', {
  message: 'An error occurred'
});

module.exports = {
  AuthExpired: () =>{
    return new AuthExpiredError({
      data: {},
      internalData: {
        error: `Your authorization token has expired`
      }
    });
  },
  Unauthorized: (action) => {
    return new UnauthorizedError({
      data: {
        action: action
      },
      internalData: {
        error: `User not authorized to complete action`
      }
    });
  },
  UnauthorizedMessage: (message) => {
    return new UnauthorizedError({
      internalData: {
        error: `Cannot authenticate, invalid password`
      }
    });
  },
  InputInvalid: (operation, errors) => {
    if (_.isArray(errors)) {
      errors = [errors];
    }
    return new InputInvalidError({
      data: errors,
      internalData: {
        error: `GQL input validation failed in ${operation}`
      }
    });
  },
  ResourceNotFound: (resource, criteria) => {
    return new ResourceNotFound({
      data: {
        resource: resource,
        criteria: criteria
      },
      internalData: {
        error: `Could not find resource "${resource}" that matches ${criteria}`
      }
    });
  },
  UserNotFound: (criteria) => {
    return new UserNotFound({
      data: {
        criteria: criteria
      },
      internalData: {
        error: `Could not find User that matches ${criteria}`
      }
    });
  },
  GenericError: (message, data = {}) => {
    return new GenericError({
      data: data,
      internalData: {
        error: message
      }
    });
  }
};