import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes require authentication
const protectedRoutes = ['/account', '/account/wishlist', '/account/addresses', '/account/orders', '/checkout'];
// Auth routes shouldn't be accessible by already authenticated users
const authRoutes = ['/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !session) {
    // Redirect unauthenticated users trying to access protected routes
    const url = new URL('/login', request.url);
    if (pathname.startsWith('/checkout')) {
      url.searchParams.set('returnUrl', '/checkout');
    } else {
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      url.searchParams.set('returnUrl', pathname);
    }
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && session) {
    // Redirect authenticated users away from auth pages
    return NextResponse.redirect(new URL('/account', request.url));
  }

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
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
