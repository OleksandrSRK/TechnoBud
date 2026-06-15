import { Router } from 'express'
import { getBrands, getColors, getMaterials, getEnergyClasses } from '../controllers/filters.controller'

const router = Router()

router.get('/brands', getBrands)
router.get('/colors', getColors)
router.get('/materials', getMaterials)
router.get('/energy-classes', getEnergyClasses)

export default router