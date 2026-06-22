import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { projectAPI } from '../services/api'
import { ArrowLeft } from 'lucide-react'
import ProjectForm from '../components/ProjectForm'

const CreateProjectPage = () => {
  const navigate = useNavigate()
  const { user, isAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Redirect if not authenticated
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Login Required</h1>
          <p className="text-slate-600 mb-6">You must be logged in to create a project.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const handleCreateProject = async (formData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await projectAPI.create(formData)

      if (response.data.success) {
        navigate(`/projects/${response.data.data._id}`)
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create project. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create New Project</h1>
          <p className="text-lg text-slate-600">
            Share your idea and build your dream team
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-8">
          <ProjectForm
            onSubmit={handleCreateProject}
            isLoading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateProjectPage