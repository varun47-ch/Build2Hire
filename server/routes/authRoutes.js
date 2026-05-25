import express from 'express'
import { register, login, logout } from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'

const router = express.Router()

//  POST /api/auth/register
router.post('/register', register)

// POST /api/auth/login
router.post('/login', login)

// POST /api/auth/logout
router.post('/logout', authenticate, logout)

export default router