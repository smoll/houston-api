const createError = require('apollo-errors').createError;


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

module.exports = {
  AuthExpired: () =>{
    return new AuthExpiredError({
      data: {
        something: 'important'
      },
      internalData: {
        error: `The SQL server died.`
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
  InputInvalid: (operation, field, requirement) => {
    return new InputInvalidError({
      data: {
        field: field,
        requirement: requirement
      },
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
};