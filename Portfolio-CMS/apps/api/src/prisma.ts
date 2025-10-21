import { PrismaClient } from '../../../generated/prisma';

let prisma: PrismaClient;

/**
 * Shared Prisma client instance to reuse connections across the API.
 */
export function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }

  return prisma;
}
