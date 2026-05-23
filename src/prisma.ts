import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import fs from 'fs'
import path from 'path'

const dbUrl = new URL(process.env.DATABASE_URL!)

const caCertPath = path.join(process.cwd(), 'prisma', 'ca.pem')
const caCert = fs.readFileSync(caCertPath)

const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: Number(dbUrl.port || 3306),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    connectionLimit: 10,
    ssl: {
        ca: caCert
    }
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