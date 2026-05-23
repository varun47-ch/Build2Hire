import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      })
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      })
    }
    
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account deactivated' 
      })
    }
    
    // Attach user to request
    req.user = user
    next()
    
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
}