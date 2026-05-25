import mongoose from 'mongoose'

const ROLES = ['frontend', 'backend', 'ml', 'designer', 'devops', 'other']

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 20
  },
  
  githubUrl: {
    type: String,
    required: true
  },
  
  projectType: {
    type: String,
    enum: ['Hackathon', 'Finalyear-Project', 'Startup'],
    required: true
  },
  
  skills: {
    type: [{ type: String, trim: true }],
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one skill required'
    }
  },
  
  rolesNeeded: [{ 
    type: String, 
    enum: ROLES,
    trim: true 
  }],
  
  members: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    validate: {
      validator: (arr) => arr.length <= 3,
      message: 'Team cannot exceed 3 members'
    }
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  status: {
    type: String,
    enum: ['recruiting', 'in-progress', 'completed'],
    default: 'recruiting'
  }
  
}, { timestamps: true })

const Project = mongoose.model('Project', projectSchema)

export default Project