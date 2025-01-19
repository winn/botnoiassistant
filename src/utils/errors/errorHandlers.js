import { ValidationError, NetworkError, AuthenticationError, AuthorizationError } from './errorTypes';

export function handleApiError(error) {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        if (data.validationErrors) {
          throw new ValidationError('Validation failed', data.validationErrors);
        }
        throw new Error(data.message || 'Bad request');

      case 401:
        throw new AuthenticationError();

      case 403:
        throw new AuthorizationError();

      case 404:
        throw new Error('Resource not found');

      case 429:
        throw new Error('Too many requests. Please try again later.');

      case 500:
        throw new Error('Internal server error. Please try again later.');

      default:
        throw new NetworkError(`Request failed with status ${status}`);
    }
  }

  if (error.request) {
    throw new NetworkError('No response received from server');
  }

  throw error;
}

export function handleDatabaseError(error) {
  if (error.code === '23505') { // Unique violation
    throw new ValidationError('A record with this value already exists');
  }

  if (error.code === '23503') { // Foreign key violation
    throw new ValidationError('Referenced record does not exist');
  }

  throw error;
}

export function handleAuthError(error) {
  switch (error.code) {
    case 'auth/invalid-email':
      throw new ValidationError('Invalid email address');

    case 'auth/user-disabled':
      throw new AuthenticationError('Account has been disabled');

    case 'auth/user-not-found':
      throw new ValidationError('No account found with this email');

    case 'auth/wrong-password':
      throw new ValidationError('Incorrect password');

    default:
      throw error;
  }
}