export const CURRENT_TIMESTAMP = 'CURRENT_TIMESTAMP(6)';
export const AUTH_ERRORS = {
    MISSING_TOKEN: 'Authorization token is missing or malformed',
    INVALID_TOKEN: 'Token is invalid or expired',
    USER_NOT_FOUND: 'User not found',
    USER_EXISTS: 'An account with this email already exists',
    INVALID_CREDS: 'Invalid email or password',
} as const;

export const BCRYPT_ROUNDS = 12;
export const BEARER_PREFIX = 'Bearer';

export const CURRENT_USER_KEY = 'user';