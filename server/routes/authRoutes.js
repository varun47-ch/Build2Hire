import express from 'express'
import { register, login, logout } from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'

const router = express.Router()

// @route   POST /api/auth/register
router.post('/register', register)

// @route   POST /api/auth/login
router.post('/login', login)

// @route   POST /api/auth/logout
// Requires authentication
router.post('/logout', authenticate, logout)

export default router