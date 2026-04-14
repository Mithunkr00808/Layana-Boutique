import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes require authentication
const protectedRoutes = ['/account', '/checkout'];
// Auth routes shouldn't be accessible by already authenticated users
const authRoutes = ['/login', '/signup', '/forgot-password'];

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
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
    return NextResponse.redirect(url);
  }

  // Check for admin session in admin routes
  if (isAdminRoute && !session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Admin role is enforced server-side in protected admin layouts/actions.

  return NextResponse.next();
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
