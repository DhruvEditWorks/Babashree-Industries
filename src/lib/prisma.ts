import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let client = globalForPrisma.prisma;
/** Lazy initialization lets public routes render a useful setup-safe fallback before DATABASE_URL is configured. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    if (property === 'then') return undefined;
    client ??= new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
    const value = Reflect.get(client, property, client);
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
