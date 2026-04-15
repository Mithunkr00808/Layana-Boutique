import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (...args) => {
  Sentry.captureRequestError(...args);
};

export async function register(): Promise<void> {
  // Sentry initializes via sentry.server/edge/instrumentation-client config files.
}

