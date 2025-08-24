import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma Client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Initialize Prisma Client, reusing the instance in development if it exists
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // Optional: logs database queries to the console
  });

// In development, assign the Prisma Client to the global variable
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;