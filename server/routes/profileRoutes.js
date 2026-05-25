import express from 'express'
import { getMyProfile,
     updateMyProfile, 
     getUserProfile } from '../controllers/profileController.js'
import { authenticate } from '../middleware/authenticate.js'

const router = express.Router()

router.get('/me', authenticate, getMyProfile)
router.patch('/me', authenticate, updateMyProfile)
router.get('/:id', getUserProfile)

export default router