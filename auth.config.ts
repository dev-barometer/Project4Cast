import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');
      const isOnSignupPage = nextUrl.pathname.startsWith('/signup');
      const isOnApiAuth = nextUrl.pathname.startsWith('/api/auth');
      const isOnDevPage = nextUrl.pathname.startsWith('/dev'); // Allow dev page without auth

      // Allow access to login, signup, and dev pages when not logged in
      if ((isOnLoginPage || isOnSignupPage || isOnApiAuth || isOnDevPage) && !isLoggedIn) {
        return true;
      }

      // Protect all other routes
      if (isLoggedIn) {
        return true;
      }

      // Redirect to login if not authenticated
      return false;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

