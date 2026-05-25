import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      },
      message: 'Invalid email format'
    }
  },
  
  password: {
    type: String,
    minlength: 8
    
  },
  
  role: {
    type: String,
    enum: ['Student', 'Hr', 'Admin'],
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  avatar: {
    type: String  
  }
  
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

export default User