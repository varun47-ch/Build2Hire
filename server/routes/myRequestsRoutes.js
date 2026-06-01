import express from 'express'
import { getMyRequests } from '../controllers/joinRequestController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorizeRole } from '../middleware/authorizeRole.js'

const router = express.Router()

router.get('/', authenticate, authorizeRole('Student'), getMyRequests)

export default router