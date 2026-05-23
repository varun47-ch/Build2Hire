import mongoose from 'mongoose'

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  
  companyEmail: {
    type: String,
    trim: true
  },
  
  website: {
    type: String,
    required: true  
  },
  
  linkedin: {
    type: String
  },
  
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
  
}, { timestamps: true })

const Company = mongoose.model('Company', companySchema)

export default Company