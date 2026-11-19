import { config } from 'dotenv';
import * as Sentry from '@sentry/nestjs';

config({ path: '.env' });
if (process.env.NODE_ENV !== 'production') {
  config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  dataCollection: {
    userInfo: false,
    httpBodies: [],
    httpHeaders: false,
    cookies: false,
    urlQueryParams: false,
    databaseQueryData: false,
    stackFrameVariables: false,
  },
});
