import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { requireAdmin } from '../middleware/requireAdmin'
import {
    getProducts,
    getProductById,
    getAllProducts,
    getProductsPaginated,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/products.controller'

const router = Router()

router.get('/', getProducts)
router.get('/paginated', getProductsPaginated)
router.get('/:id', getProductById)

router.get('/all', authMiddleware, requireAdmin, getAllProducts)
router.post('/', authMiddleware, requireAdmin, createProduct)
router.put('/:id', authMiddleware, requireAdmin, updateProduct)
router.patch('/:id', authMiddleware, requireAdmin, updateProduct)
router.delete('/:id', authMiddleware, requireAdmin, deleteProduct)

export default router