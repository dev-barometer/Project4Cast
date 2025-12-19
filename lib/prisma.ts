import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Fix for Supabase Transaction pooler - it doesn't support PREPARE statements
// Add ?pgbouncer=true to disable prepared statements
let databaseUrl = process.env.DATABASE_URL || '';
if (databaseUrl.includes('pooler.supabase.com') && !databaseUrl.includes('pgbouncer=true')) {
  databaseUrl = `${databaseUrl}?pgbouncer=true`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
