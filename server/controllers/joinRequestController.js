import JoinRequest from '../models/JoinRequest.js'
import Project from '../models/Project.js'

//Send join request to a project
export const createJoinRequest = async (req, res) => {
  try {
    const { role } = req.body
    const projectId = req.params.id
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      })
    }
    
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    
    if (project.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot join your own project'
      })
    }

    if (project.members.length >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Team is full'
      })
    }

    const existingPending = await JoinRequest.findOne({
      requestedBy: req.user._id,
      projectId,
      status: 'pending'
    })
    
    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending request for this project'
      })
    }

    const isMember = project.members.some(
      member => member.toString() === req.user._id.toString()
    )
    
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this team'
      })
    }
    
    const joinRequest = await JoinRequest.create({
      requestedBy: req.user._id,
      projectId,
      role
    })
    
    await joinRequest.populate('requestedBy', 'name email')
    await joinRequest.populate('projectId', 'title')
    
    res.status(201).json({
      success: true,
      data: joinRequest
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Accept or reject join request
export const updateJoinRequest = async (req, res) => {
  try {
    const { status } = req.body
    const requestId = req.params.requestId
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      })
    }
    
    const joinRequest = await JoinRequest.findById(requestId)
    
    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      })
    }
    

    const project = await Project.findById(joinRequest.projectId)
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project head can accept or reject requests'
      })
    }
 
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      })
    }
    
    if (status === 'approved' && project.members.length >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Team is full'
      })
    }
    
    joinRequest.status = status
    await joinRequest.save()
    
    if (status === 'approved') {
      project.members.push(joinRequest.requestedBy)
      await project.save()
    }
    
    await joinRequest.populate('requestedBy', 'name email')
    await joinRequest.populate('projectId', 'title')
    
    res.status(200).json({
      success: true,
      data: joinRequest
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//Get user's own sent join request
export const getMyRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find({ requestedBy: req.user._id })
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 })
    
    res.status(200).json({
      success: true,
      data: requests
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}