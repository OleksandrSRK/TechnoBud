import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import fs from 'fs'
import path from 'path'

const caCertPath = path.join(process.cwd(), 'prisma', 'ca.pem')
console.log('[DEBUG] Looking for cert at:', caCertPath)

let caCert: Buffer | undefined;
try {
    caCert = fs.readFileSync(caCertPath)
    console.log('[DEBUG] Cert loaded successfully')
} catch (e) {
    console.error('[ERROR] Could not read cert file:', e)
}

const dbUrl = new URL(process.env.DATABASE_URL!)

const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: Number(dbUrl.port || 4000),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    ssl: caCert ? { ca: caCert } : undefined,
    connectionLimit: 10,
})

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: ['query', 'info', 'warn', 'error'],
    })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}