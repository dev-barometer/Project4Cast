import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Disable prepared statements for Supabase Transaction pooler compatibility
// Transaction pooler doesn't support PREPARE statements
if (process.env.DATABASE_URL?.includes('pooler.supabase.com')) {
  // Configure Prisma to not use prepared statements
  // This is done via connection string parameter
  const originalUrl = process.env.DATABASE_URL;
  if (!originalUrl.includes('?pgbouncer=true')) {
    process.env.DATABASE_URL = `${originalUrl}?pgbouncer=true&connection_limit=1`;
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
