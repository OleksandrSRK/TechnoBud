import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import productsRoutes from './routes/products.routes'
import categoriesRoutes from './routes/categories.routes'
import brandsRoutes from './routes/brands.routes'
import ordersRoutes from './routes/orders.routes'
import dotenv from 'dotenv'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/products', productsRoutes)
app.use('/categories', categoriesRoutes)
app.use('/brands', brandsRoutes)
app.use('/orders', ordersRoutes)
dotenv.config()

export default app