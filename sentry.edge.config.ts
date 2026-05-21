import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN, SENTRY_SERVER_CONFIG } from "./src/shared/config/sentry";

Sentry.init({
  dsn: SENTRY_DSN,
  ...SENTRY_SERVER_CONFIG,
});
