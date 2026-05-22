import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { getCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cart.controller'

const router = Router()

router.get('/', authMiddleware, getCart)
router.post('/:productId', authMiddleware, addToCart)
router.patch('/:itemId', authMiddleware, updateCartItem)
router.delete('/:itemId', authMiddleware, removeFromCart)

export default router