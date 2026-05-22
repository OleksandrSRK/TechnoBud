import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { getProductReviews, createReview } from '../controllers/reviews.controller'

const router = Router()

router.get('/:productId', getProductReviews)
router.post('/:productId', authMiddleware, createReview)

export default router