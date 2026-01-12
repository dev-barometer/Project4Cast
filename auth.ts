import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          return null;
        }

        // Find user by email
        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email },
          });
        } catch (error: any) {
          // Database connection error
          console.error('Database connection error during login:', error);
          throw new Error('Database connection failed. Please try again later.');
        }

        if (!user) {
          return null;
        }

        // Check if account is paused
        if (user.isPaused) {
          throw new Error('Your account has been paused. Please contact an administrator.');
        }

        // Check if user has a password set
        if (!user.password) {
          throw new Error('No password set for this account. Please use password reset or contact an administrator.');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Return user object (this will be stored in the session)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'USER';
      }
      return session;
    },
  },
});

