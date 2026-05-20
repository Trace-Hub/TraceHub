import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN, SENTRY_CONFIG } from "@/shared/config/sentry";

Sentry.init({
  dsn: SENTRY_DSN,
  ...SENTRY_CONFIG,
});
