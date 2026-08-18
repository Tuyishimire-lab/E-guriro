import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes inside /seller/** that anyone can visit (no auth needed)
const PUBLIC_SELLER_PATTERNS = [
  /^\/seller\/[^/]+\/store(\/|$)/,   // /seller/[id]/store — public storefront
];

// Routes that require a specific role stored in the auth cookie
const PROTECTED: { pattern: RegExp; role: 'admin' | 'seller' | 'buyer' | 'any' }[] = [
  { pattern: /^\/admin(\/|$)/, role: 'admin' },
  { pattern: /^\/seller(\/|$)/, role: 'seller' },
  { pattern: /^\/buyer(\/|$)/, role: 'buyer' },
  { pattern: /^\/checkout(\/|$)/, role: 'any' },
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public seller sub-routes first (e.g. store pages)
  if (PUBLIC_SELLER_PATTERNS.some(p => p.test(pathname))) {
    return NextResponse.next();
  }

  // Find the first matching protected route
  const match = PROTECTED.find(p => p.pattern.test(pathname));
  if (!match) return NextResponse.next();

  // Read the persisted user from the cookie (set by AuthContext on login)
  const userCookie = request.cookies.get('eguriro-user')?.value;

  // Not logged in at all
  if (!userCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = JSON.parse(decodeURIComponent(userCookie));
    const role = user?.role as string | undefined;

    // Role check
    if (match.role !== 'any' && role !== match.role) {
      // Wrong role — send to their own dashboard instead of login
      const dashboardMap: Record<string, string> = {
        admin: '/admin',
        seller: '/seller/dashboard',
        buyer: '/',
      };
      return NextResponse.redirect(new URL(dashboardMap[role ?? ''] ?? '/', request.url));
    }
  } catch {
    // Corrupt cookie — clear it and redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete('eguriro-user');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/seller/:path*',
    '/buyer/:path*',
    '/checkout',
  ],
};
