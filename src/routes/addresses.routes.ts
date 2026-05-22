import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { getAddresses, createAddress } from '../controllers/addresses.controller'

const router = Router()
router.get('/', authMiddleware, getAddresses)
router.post('/', authMiddleware, createAddress)

export default router