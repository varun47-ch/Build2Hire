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
  },
  groupLink: {
    type: String,
    required: [true, 'Group link is required'],
    trim: true,
    match: [
      /^https?:\/\/.+/,
      'Please provide a valid group link URL (e.g., https://chat.whatsapp.com/... or https://discord.gg/...)'
    ]
  },
  
  groupType: {
    type: String,
    enum: ['whatsapp', 'discord', 'telegram', 'reddit', 'slack', 'other'],
    required: [true, 'Group type is required'],
    default: 'whatsapp'
  }
  
}, { timestamps: true })

const Project = mongoose.model('Project', projectSchema)

export default Project