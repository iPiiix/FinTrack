import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token');
  const { pathname } = request.nextUrl;

  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/portfolio')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Auth routes (redirect to dashboard if already logged in)
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/portfolio/:path*', '/auth/:path*'],
};
