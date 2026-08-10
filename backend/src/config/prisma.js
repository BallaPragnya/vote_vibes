import { PrismaClient } from '@prisma/client';
import config from './env.js';

// Global singleton pattern for Prisma Client to prevent connection leaks during hot reloading in dev
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
  });
};

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (config.isDevelopment) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
