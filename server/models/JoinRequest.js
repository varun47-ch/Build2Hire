import mongoose from 'mongoose'

const ROLES = ['frontend', 'backend', 'ml', 'designer', 'devops', 'other']

const joinRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  role: {
    type: String,
    enum: ROLES,
    required: true,
    trim: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
  
}, { timestamps: true })

// Compound index for fast lookup
joinRequestSchema.index({ requestedBy: 1, projectId: 1, status: 1 })

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema)

export default JoinRequest