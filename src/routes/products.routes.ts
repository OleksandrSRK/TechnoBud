import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { requireAdmin } from '../middleware/requireAdmin'
import {
    getProducts,
    getProductById,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/products.controller'

const router = Router()

router.get('/', getProducts)
router.get('/all', authMiddleware, requireAdmin, getAllProducts)
router.get('/:id', getProductById)

router.post('/', authMiddleware, requireAdmin, createProduct)
router.put('/:id', authMiddleware, requireAdmin, updateProduct)
router.patch('/:id', authMiddleware, requireAdmin, updateProduct)
router.delete('/:id', authMiddleware, requireAdmin, deleteProduct)

export default router