import express from 'express'
import cors from 'cors'
import { prisma } from './prisma'

import authRouter from './routes/auth.routes'
import productsRoutes from './routes/products.routes'
import categoriesRoutes from './routes/categories.routes'
import brandsRoutes from './routes/brands.routes'
import ordersRoutes from './routes/orders.routes'
import usersRoutes from './routes/users.routes'
import reviewsRoutes from './routes/reviews.routes'
import wishlistRoutes from './routes/wishlist.routes'
import cartRoutes from './routes/cart.routes'
import addressesRoutes from './routes/addresses.routes'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use((req, _res, next) => {
    console.log(`[REQ] ${req.method} ${req.originalUrl}`)
    next()
})

app.use('/auth', authRouter)
app.use('/products', productsRoutes)
app.use('/categories', categoriesRoutes)
app.use('/brands', brandsRoutes)
app.use('/orders', ordersRoutes)
app.use('/users', usersRoutes)
app.use('/reviews', reviewsRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/addresses', addressesRoutes)

app.get('/', (_req, res) => {
    res.send('API is working')
})

app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' })
})

async function bootstrap() {
    try {
        console.log('[BOOT] Server starting...')
        console.log('[DB] products =', await prisma.product.count())
        console.log('[DB] brands =', await prisma.brand.count())
        console.log('[DB] categories =', await prisma.category.count())

        app.listen(PORT, () => {
            console.log(`Server running: http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error('[BOOT] Failed to start server:', error)
        process.exit(1)
    }
}

bootstrap()