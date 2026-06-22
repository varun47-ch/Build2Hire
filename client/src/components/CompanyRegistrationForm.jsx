import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { companyAPI } from '../services/api'
import { AlertCircle, Loader, CheckCircle } from 'lucide-react'

export default function CompanyRegistrationForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    website: '',
    linkedin: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await companyAPI.createCompany(formData)
      
      if (response.data.success) {
        setSuccess(true)
        setFormData({
          companyName: '',
          companyEmail: '',
          website: '',
          linkedin: ''
        })

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/hr-dashboard')
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register company')
      console.error('Register company error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle size={64} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Company Registered Successfully! ✅
          </h2>
          <p className="text-gray-600 mb-4">
            Your company has been submitted for admin verification.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>Status:</strong> Pending Approval
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Our admin team will review your company details and approve/reject within 24 hours.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Redirecting to HR Dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Register Your Company
          </h1>
          <p className="text-gray-600">
            Fill in your company details for admin verification
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Company Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g., TechCorp Solutions"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Website <span className="text-red-600">*</span>
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Company Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Company Email
              </label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="contact@yourcompany.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                LinkedIn Profile
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/yourcompany"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Important:</strong> Your company will be reviewed by our admin team. 
                You'll receive approval/rejection via email within 24 hours.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Company'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Want to see company status?{' '}
            <button
              onClick={() => navigate('/hr-dashboard')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Go to Dashboard
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}