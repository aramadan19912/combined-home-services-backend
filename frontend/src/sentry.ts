import * as Sentry from '@sentry/react';
import { getConfig } from '@/lib/config';

export function initSentry() {
  const { sentryDsn, environment } = getConfig();
  if (!sentryDsn) return;
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: true }),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment,
  });
}
