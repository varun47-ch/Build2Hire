import express from 'express'
import { contactAboutProject } from '../controllers/hrController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorizeRole } from '../middleware/authorizeRole.js'

const router = express.Router()

router.post('/:id/contact', authenticate, authorizeRole('Hr'), contactAboutProject)

export default router