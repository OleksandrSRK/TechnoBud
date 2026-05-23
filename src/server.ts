import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import fs from 'fs'
import path from 'path'

import authRouter from './routes/auth.routes'
import productsRoutes from './routes/products.routes'
import categoriesRoutes from './routes/categories.routes'
import brandsRoutes from './routes/brands.routes'
import ordersRoutes from './routes/orders.routes'
import usersRoutes from './routes/users.routes'
import reviewsRoutes from './routes/reviews.routes'
import cartRoutes from './routes/cart.routes'
import wishlistRoutes from './routes/wishlist.routes'
import addressesRoutes from './routes/addresses.routes'

console.log('[DEBUG] Starting Prisma configuration...')

// Строка подключения к TiDB (Render) или локальной MariaDB
const dbUrl = new URL(process.env.DATABASE_URL!)
const caCertPath = path.join(process.cwd(), 'prisma', 'ca.pem')
let caCert: Buffer | undefined
try {
    caCert = fs.readFileSync(caCertPath)
} catch {
    console.warn('[WARN] CA certificate not found, connecting without SSL')
}

const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: Number(dbUrl.port || 3306),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    ssl: caCert ? { ca: caCert } : undefined,
    connectionLimit: 10,
})

let prismaInstance: PrismaClient
try {
    console.log('[DEBUG] Initializing PrismaClient...')
    prismaInstance = new PrismaClient({
        adapter,
        log: ['query', 'info', 'warn', 'error'],
    })
    console.log('[DEBUG] PrismaClient initialized.')
} catch (e) {
    console.error('[CRITICAL] Error initializing PrismaClient:', e)
    process.exit(1)
}

// Сохраняем инстанс для глобального использования (опционально)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = globalForPrisma.prisma ?? prismaInstance
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

// ---------- Express приложение ----------
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use((req, _res, next) => {
    console.log(`[REQ] ${req.method} ${req.originalUrl}`)
    next()
})

// Подключаем роуты
app.use('/auth', authRouter)
app.use('/products', productsRoutes)
app.use('/categories', categoriesRoutes)
app.use('/brands', brandsRoutes)
app.use('/orders', ordersRoutes)
app.use('/users', usersRoutes)
app.use('/reviews', reviewsRoutes)
app.use('/cart', cartRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/addresses', addressesRoutes)

app.get('/', (_req, res) => {
    res.send('API is working')
})

app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' })
})

// Запуск сервера
async function bootstrap() {
    try {
        console.log('[BOOT] Server starting...')
        // Проверка подключения к БД (опционально)
        await prisma.$connect()
        console.log('[DB] Connected successfully')

        app.listen(PORT, () => {
            console.log(`Server running: http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error('[BOOT] Failed to start server:', error)
        process.exit(1)
    }
}

bootstrap()