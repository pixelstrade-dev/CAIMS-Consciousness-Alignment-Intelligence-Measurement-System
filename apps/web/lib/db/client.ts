import { PrismaClient } from '@/app/generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const provider = process.env.CAIMS_DB_PROVIDER ?? 'postgresql';
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[CAIMS] Database provider: ${provider}`);
  }
  // @ts-expect-error Prisma v7 constructor signature
  return new PrismaClient();
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy to avoid instantiating PrismaClient at import time (breaks Next.js build)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
