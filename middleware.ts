import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Check authorization
  const isOnLoginPage = nextUrl.pathname.startsWith('/login');
  const isOnSignupPage = nextUrl.pathname.startsWith('/signup');
  const isOnForgotPasswordPage = nextUrl.pathname.startsWith('/forgot-password');
  const isOnResetPasswordPage = nextUrl.pathname.startsWith('/reset-password');
  const isOnVerifyEmailPage = nextUrl.pathname.startsWith('/verify-email');
  const isOnApiAuth = nextUrl.pathname.startsWith('/api/auth');
  const isOnDevPage = nextUrl.pathname.startsWith('/dev');
  const isOnInvitePage = nextUrl.pathname.startsWith('/invite');
  const isOnAdminPage = nextUrl.pathname.startsWith('/admin');

  // Allow access to login, signup, password reset, email verification, dev, API auth, and invitation pages when not logged in
  if ((isOnLoginPage || isOnSignupPage || isOnForgotPasswordPage || isOnResetPasswordPage || isOnVerifyEmailPage || isOnApiAuth || isOnDevPage || isOnInvitePage) && !isLoggedIn) {
    return NextResponse.next();
  }

  // Allow access to admin pages when logged in
  if (isOnAdminPage && isLoggedIn) {
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

