import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes require authentication
const protectedRoutes = ['/account', '/checkout'];
// Auth routes shouldn't be accessible by already authenticated users
const authRoutes = ['/login', '/signup', '/forgot-password'];

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(self)",
  "X-DNS-Prefetch-Control": "on",
};

// In production, add HSTS
const isProduction = process.env.NODE_ENV === "production";

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return response;
}

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const isAdminCookie = request.cookies.get('isAdmin')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isAdminLoginRoute = pathname === '/admin/login';
  const isAdminRoute = pathname.startsWith('/admin') && !isAdminLoginRoute;

  // Check for standard session in protected routes
  if (isProtectedRoute && !session) {
    const url = new URL('/login', request.url);
    if (pathname.startsWith('/checkout')) {
      url.searchParams.set('returnUrl', '/checkout');
    } else {
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      url.searchParams.set('returnUrl', pathname);
    }
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // Check for admin session in admin routes
  if (isAdminRoute && !session) {
    return applySecurityHeaders(NextResponse.redirect(new URL('/admin/login', request.url)));
  }

  // A known non-admin session should never access admin pages.
  if (isAdminRoute && isAdminCookie !== 'true') {
    return applySecurityHeaders(NextResponse.redirect(new URL('/', request.url)));
  }

  if (isAuthRoute && session) {
    // Redirect authenticated users away from auth pages
    return applySecurityHeaders(NextResponse.redirect(new URL('/account', request.url)));
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|otf)).*)',
  ],
};
