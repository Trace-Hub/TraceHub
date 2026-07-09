import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import { SENTRY_DSN, SENTRY_CLIENT_CONFIG } from "./src/shared/config/sentry";

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [Sentry.replayIntegration()],
  ...SENTRY_CLIENT_CONFIG,
});

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: "2026-01-30",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
