import express from 'express'
import {
  getAllUsers,
  getUserById,
  updateUserStatus
} from '../controllers/adminController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorizeRole } from '../middleware/authorizeRole.js'

const router = express.Router()

router.get('/', authenticate, authorizeRole('Admin'), getAllUsers)
router.get('/:id', authenticate, authorizeRole('Admin'), getUserById)
router.patch('/:id/status', authenticate, authorizeRole('Admin'), updateUserStatus)

export default router