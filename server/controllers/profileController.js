import User from '../models/User.js'

//Get logged in user's profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: user
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Update logged in user's profile
export const updateMyProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'avatar']
    const updates = {}
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })
    
    if (req.body.email || req.body.password || req.body.role) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update email, password, or role '
      })
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')
    
    res.status(200).json({
      success: true,
      data: user
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get any user's profile by ID
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: user
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}