import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller'

const router = Router()

router.get('/', authMiddleware, getWishlist)
router.post('/:productId', authMiddleware, addToWishlist)
router.delete('/:productId', authMiddleware, removeFromWishlist)

export default router