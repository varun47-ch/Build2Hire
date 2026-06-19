import Project from '../models/Project.js'
import JoinRequest from '../models/JoinRequest.js'

//Get all projects 
export const getAllProjects = async (req, res) => {
  try {
    const { skill, type, status, page = 1, limit = 10 } = req.query
    
    
    const filter = {}
    if (skill) filter.skills = { $in: [skill] }
    if (type) filter.projectType = type
    if (status) filter.status = status
    
    const skip = (page - 1) * limit
    
    const projects = await Project.find(filter)
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
    
    const total = await Project.countDocuments(filter)
    
    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//Get student's own projects
export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user._id })
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 })
    
    res.status(200).json({
      success: true,
      data: projects
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//Get single project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar')
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: project
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get project team members
export const getProjectTeam = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar role')
      .populate('members', 'name email avatar role')
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    
    const team = [
      { ...project.createdBy.toObject(), position: 'Project Head' },
      ...project.members.map(member => ({ ...member.toObject(), position: 'Member' }))
    ]
    
    res.status(200).json({
      success: true,
      data: {
        projectId: project._id,
        projectTitle: project.title,
        team
      }
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
//Join-Requests
export const getProjectJoinRequests = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project head can view join requests'
      })
    }
    
    const requests = await JoinRequest.find({ projectId: req.params.id })
      .populate('requestedBy', 'name email avatar')
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

// Create new project
export const createProject = async (req, res) => {
  try {
    const { title, description, githubUrl, projectType, skills, rolesNeeded } = req.body
    
    if (!title || !description || !githubUrl || !projectType || !skills) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      })
    }
    
    const project = await Project.create({
      title,
      description,
      githubUrl,
      projectType,
      skills,
      rolesNeeded: rolesNeeded || [],
      createdBy: req.user._id,
      members: []
    })
    
    await project.populate('createdBy', 'name email avatar')
    
    res.status(201).json({
      success: true,
      data: project
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//Update project details
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      })
    }
    
    const allowedUpdates = ['title', 'description', 'githubUrl', 'skills', 'rolesNeeded']
    const updates = {}
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })
    
    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email avatar')
     .populate('members', 'name email avatar')
    
    res.status(200).json({
      success: true,
      data: updatedProject
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//Update project status
export const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      })
    }
    
    const project = await Project.findById(req.params.id)
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      })
    }
    
    // Update status
    project.status = status
    await project.save()
    
    res.status(200).json({
      success: true,
      data: project
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    
    // Check if user is creator OR admin
    const isCreator = project.createdBy.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'Admin'
    
    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      })
    }
    
    // Delete associated join requests (cleanup)
    await JoinRequest.deleteMany({ projectId: req.params.id })
    
    await project.deleteOne()
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}