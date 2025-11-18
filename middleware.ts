import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Check authorization
  const isOnLoginPage = nextUrl.pathname.startsWith('/login');
  const isOnSignupPage = nextUrl.pathname.startsWith('/signup');
  const isOnApiAuth = nextUrl.pathname.startsWith('/api/auth');
  const isOnDevPage = nextUrl.pathname.startsWith('/dev');

  // Allow access to login, signup, dev, and API auth pages when not logged in
  if ((isOnLoginPage || isOnSignupPage || isOnApiAuth || isOnDevPage) && !isLoggedIn) {
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isLoggedIn) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)'],
};

