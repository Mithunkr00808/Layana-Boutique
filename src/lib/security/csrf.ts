import { NextRequest, NextResponse } from "next/server";

function collectAllowedOrigins(request: NextRequest): Set<string> {
  const allowed = new Set<string>();

  allowed.add(request.nextUrl.origin);

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredSiteUrl) {
    try {
      allowed.add(new URL(configuredSiteUrl).origin);
    } catch {
      // Ignore malformed env configuration and fall back to request origin.
    }
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
    allowed.add(`${forwardedProto}://${forwardedHost}`);
  }

  return allowed;
}

function readRequestOrigin(request: NextRequest): string | null {
  const originHeader = request.headers.get("origin");
  if (originHeader) return originHeader;

  const refererHeader = request.headers.get("referer");
  if (!refererHeader) return null;

  try {
    return new URL(refererHeader).origin;
  } catch {
    return null;
  }
}

export function isSameOriginRequest(request: NextRequest): boolean {
  const requestOriginRaw = readRequestOrigin(request);
  if (!requestOriginRaw) {
    return false;
  }

  try {
    const requestOrigin = new URL(requestOriginRaw).origin;
    return collectAllowedOrigins(request).has(requestOrigin);
  } catch {
    return false;
  }
}

export function csrfRejectedResponse() {
  return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
}
