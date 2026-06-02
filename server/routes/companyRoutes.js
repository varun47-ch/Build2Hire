import express from 'express'
import {
  createCompany,
  getMyCompany,
  getAllCompanies,
  getCompanyById,
  updateCompanyStatus
} from '../controllers/companyController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorizeRole } from '../middleware/authorizeRole.js'

const router = express.Router()

// HR routes
router.post('/', authenticate, authorizeRole('Hr'), createCompany)
router.get('/profile', authenticate, authorizeRole('Hr'), getMyCompany)

// Admin routes - SPECIFIC before DYNAMIC
router.get('/', authenticate, authorizeRole('Admin'), getAllCompanies)
router.get('/:id', authenticate, authorizeRole('Admin'), getCompanyById)
router.patch('/:id', authenticate, authorizeRole('Admin'), updateCompanyStatus)

export default router