import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import fs from 'fs'
import path from 'path'

console.log('[DEBUG] Starting Prisma configuration...');

const dbUrl = new URL(process.env.DATABASE_URL!)
const caCertPath = path.join(process.cwd(), 'prisma', 'ca.pem')
const caCert = fs.readFileSync(caCertPath)

const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: Number(dbUrl.port || 4000),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    ssl: { ca: caCert },
    connectionLimit: 10,
})

let prismaInstance: PrismaClient;

try {
    console.log('[DEBUG] Initializing PrismaClient...');
    prismaInstance = new PrismaClient({
        adapter,
        log: ['query', 'info', 'warn', 'error'],
    });
    console.log('[DEBUG] PrismaClient initialized.');
} catch (e) {
    console.error('[CRITICAL] Error initializing PrismaClient:', e);
    process.exit(1);
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? prismaInstance

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}