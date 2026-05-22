import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { requireAdmin } from '../middleware/requireAdmin'
import {
    getCategories,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categories.controller'

const router = Router()


router.get('/', getCategories)
router.get('/:slug', getCategoryBySlug)

router.post('/', authMiddleware, requireAdmin, createCategory)
router.put('/:id', authMiddleware, requireAdmin, updateCategory)
router.patch('/:id', authMiddleware, requireAdmin, updateCategory)
router.delete('/:id', authMiddleware, requireAdmin, deleteCategory)

export default router