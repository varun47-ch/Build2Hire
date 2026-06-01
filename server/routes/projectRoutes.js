import express from 'express'
import {
  getAllProjects,
  getMyProjects,
  getProjectById,
  getProjectTeam,
  getProjectJoinRequests,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject
} from '../controllers/projectController.js'
import { 
  createJoinRequest, 
  updateJoinRequest 
} from '../controllers/joinRequestController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorizeRole } from '../middleware/authorizeRole.js'

const router = express.Router()


router.get('/my-projects', authenticate, authorizeRole('Student'), getMyProjects)
// Public routes
router.get('/', getAllProjects)
router.get('/:id', getProjectById)

// Student routes
router.post('/', authenticate, authorizeRole('Student'), createProject)
router.get('/:id/join-requests', authenticate, authorizeRole('Student'), getProjectJoinRequests)
router.patch('/:id', authenticate, authorizeRole('Student'), updateProject)
router.patch('/:id/status', authenticate, authorizeRole('Student'), updateProjectStatus)

// HR routes
router.get('/:id/team', authenticate, authorizeRole('Hr'), getProjectTeam)

//Admin & Student
router.delete('/:id', authenticate, authorizeRole('Student', 'Admin'), deleteProject)

// Join request routes - nested under projects
router.get('/:id/join-requests', 
  authenticate, 
  authorizeRole('Student'), 
  getProjectJoinRequests
)

router.post('/:id/join-requests', 
  authenticate, 
  authorizeRole('Student'), 
  createJoinRequest
)

router.patch('/:id/join-requests/:requestId', 
  authenticate, 
  authorizeRole('Student'), 
  updateJoinRequest
)

export default router