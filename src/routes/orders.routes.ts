import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { requireAdmin } from '../middleware/requireAdmin'
import {
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    createOrder,
    getOrderById,
} from '../controllers/orders.controller'

const router = Router()

router.get('/my', authMiddleware, getMyOrders)
router.post('/', authMiddleware, createOrder)

router.get('/all', authMiddleware, requireAdmin, getAllOrders)
router.get('/:id', authMiddleware, getOrderById)
router.patch('/:id/status', authMiddleware, requireAdmin, updateOrderStatus)

export default router