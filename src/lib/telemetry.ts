import * as Sentry from "@sentry/nextjs";

type TelemetryContext = Record<string, string | number | boolean | null | undefined>;

export function addTelemetryBreadcrumb(
  message: string,
  category: string,
  data?: TelemetryContext
): void {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  Sentry.addBreadcrumb({
    category,
    message,
    level: "info",
    data,
  });
}

export function captureTelemetryError(
  error: unknown,
  message: string,
  context?: TelemetryContext
): void {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      for (const [key, value] of Object.entries(context)) {
        scope.setExtra(key, value);
      }
    }
    scope.setTag("area", "backend");
    scope.setFingerprint([message]);
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
  });
}

