import Company from '../models/Company.js'

// Register a company
export const createCompany = async (req, res) => {
  try {
    const { companyName, companyEmail, website, linkedin } = req.body
    
    if (!companyName || !website) {
      return res.status(400).json({
        success: false,
        message: 'Company name and website are required'
      })
    }
    const existingCompany = await Company.findOne({ registeredBy: req.user._id })
    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: 'You have already registered a company'
      })
    }
    const company = await Company.create({
      companyName,
      companyEmail: companyEmail || null,
      website,
      linkedin: linkedin || null,
      registeredBy: req.user._id,
      status: 'pending'
    })
    
    await company.populate('registeredBy', 'name email')
    
    res.status(201).json({
      success: true,
      data: company
    })
    
  } catch (error) {
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

// Get HR's own company
export const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ registeredBy: req.user._id })
      .populate('registeredBy', 'name email')
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: company
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//Get all companies (admin view)
export const getAllCompanies = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    
    const filter = {}
    if (status) filter.status = status
    
    const skip = (page - 1) * limit
    
    const companies = await Company.find(filter)
      .populate('registeredBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
    
    const total = await Company.countDocuments(filter)
    
    res.status(200).json({
      success: true,
      data: companies,
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

// Get specific company (admin)

export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('registeredBy', 'name email')
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: company
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//Update company status (approve/reject)
export const updateCompanyStatus = async (req, res) => {
  try {
    const { status } = req.body
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be "pending", "approved", or "rejected"'
      })
    }
    
    const company = await Company.findById(req.params.id)
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      })
    }
    
    company.status = status
    await company.save()
    
    await company.populate('registeredBy', 'name email')
    
    res.status(200).json({
      success: true,
      data: company
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}