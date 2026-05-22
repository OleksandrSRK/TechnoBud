import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { requireAdmin } from '../middleware/requireAdmin'
import {
    getBrands,
    getBrandBySlug,
    createBrand,
    updateBrand,
    deleteBrand,
} from '../controllers/brands.controller'

const router = Router()


router.get('/', getBrands)
router.get('/:slug', getBrandBySlug)

router.post('/', authMiddleware, requireAdmin, createBrand)
router.put('/:id', authMiddleware, requireAdmin, updateBrand)
router.patch('/:id', authMiddleware, requireAdmin, updateBrand)
router.delete('/:id', authMiddleware, requireAdmin, deleteBrand)

export default router