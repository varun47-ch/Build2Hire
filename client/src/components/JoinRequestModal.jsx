import { useState } from 'react'
import { X, Loader, AlertCircle } from 'lucide-react'
import { joinRequestAPI } from '../services/api'

const JoinRequestModal = ({ projectId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    role: '',
    message: ''
  })

  const roles = [
    { value: 'frontend', label: 'Frontend Developer' },
    { value: 'backend', label: 'Backend Developer' },
    { value: 'ml', label: 'ML Engineer' },
    { value: 'designer', label: 'UI/UX Designer' },
    { value: 'devops', label: 'DevOps Engineer' },
    { value: 'other', label: 'Other' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.role) {
        setError('Please select a role')
        setLoading(false)
        return
      }

      const response = await joinRequestAPI.create(projectId, {
        role: formData.role,
        message: formData.message
      })

      if (response.data.success) {
        onSuccess()
        onClose()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send join request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Join Project</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
              What's your role? <span className="text-red-600">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100 text-sm"
            >
              <option value="">Select a role...</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Tell the project head what role you want to fill
            </p>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
              Why do you want to join?
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell the project head about your skills and interest..."
              rows={4}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 text-sm resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Optional but recommended (helps increase chances)
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              <span>{loading ? 'Sending...' : 'Send Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JoinRequestModal