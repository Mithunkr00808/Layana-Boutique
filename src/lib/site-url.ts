const DEFAULT_SITE_URL = "https://layanaboutique.in";

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) {
    return DEFAULT_SITE_URL;
  }

  try {
    const normalized = new URL(configured);
    return trimTrailingSlash(normalized.toString());
  } catch {
    return DEFAULT_SITE_URL;
  }
}

