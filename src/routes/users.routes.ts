import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { requireAdmin } from '../middleware/requireAdmin'
import { getUsers, updateUser, deleteUser } from '../controllers/users.controller'

const router = Router()


router.get('/', authMiddleware, requireAdmin, getUsers)
router.put('/:id', authMiddleware, requireAdmin, updateUser)
router.patch('/:id', authMiddleware, requireAdmin, updateUser)
router.delete('/:id', authMiddleware, requireAdmin, deleteUser)

export default router