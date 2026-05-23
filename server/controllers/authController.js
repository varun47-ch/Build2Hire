import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    
    // Validate password length (before hashing)
    if (password && password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      })
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    })
    
    // Generate token
    const token = generateToken(user._id)
    
    // Send response
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
    
  } catch (error) {
    // Handle duplicate key error (email unique constraint)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      })
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated'
      })
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }
    
    // Generate token
    const token = generateToken(user._id)
    
    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  // With JWT, logout is handled client-side by removing token
  // Server just confirms the action
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  })
}