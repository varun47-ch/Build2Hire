import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { projectAPI } from '../services/api'
import { ArrowLeft, AlertCircle, Loader, X, MessageCircle } from 'lucide-react'

const EditProjectPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuth } = useAuth()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuth) {
      navigate('/login')
      return
    }
    fetchProject()
  }, [isAuth, navigate, id])

  const fetchProject = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await projectAPI.getById(id)

      if (response.data.success) {
        const proj = response.data.data

        if (proj.createdBy._id !== user._id) {
          setError('You can only edit your own projects')
          setLoading(false)
          return
        }

        setProject(proj)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    setSubmitting(true)

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        githubUrl: formData.githubUrl,
        skills: formData.skills,
        rolesNeeded: formData.rolesNeeded,
        groupLink: formData.groupLink,      
        groupType: formData.groupType       
      }

      const response = await projectAPI.update(id, updateData)

      if (response.data.success) {
        alert('Project updated successfully!')
        navigate(`/projects/${id}`)
      }
    } catch (err) {
      console.error('Update error:', err)
      alert(
        err.response?.data?.message ||
        'Failed to update project. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/student-dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <AlertCircle size={40} className="text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
            <p className="text-red-800 font-medium mb-6">{error}</p>
            <button
              onClick={() => navigate('/student-dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/student-dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Edit Project
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Update your project details
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="mb-8 pb-8 border-b border-slate-200">
            <p className="text-sm text-slate-600 font-medium mb-1">Project</p>
            <h2 className="text-2xl font-bold text-slate-900">
              {project.title}
            </h2>
          </div>

          <EditProjectForm
            initialData={project}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        </div>
      </div>
    </div>
  )
}

const EditProjectForm = ({ initialData, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    githubUrl: initialData.githubUrl || '',
    projectType: initialData.projectType || 'Hackathon',
    status: initialData.status || 'recruiting',
    skills: initialData.skills || [],
    rolesNeeded: initialData.rolesNeeded || [],
    groupLink: initialData.groupLink || '',        
    groupType: initialData.groupType || 'whatsapp' 
  })

  const [skillInput, setSkillInput] = useState('')
  const [roleInput, setRoleInput] = useState('')
  const [error, setError] = useState(null)

  const roleNames = {
    frontend: 'Frontend Developer',
    backend: 'Backend Developer',
    ml: 'ML Engineer',
    designer: 'UI/UX Designer',
    devops: 'DevOps Engineer',
    other: 'Other'
  }

  const roles = ['frontend', 'backend', 'ml', 'designer', 'devops', 'other']

  const groupTypes = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'discord', label: 'Discord' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'slack', label: 'Slack' },
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

  const addSkill = () => {
    const skill = skillInput.trim()

    if (!skill) {
      setError('Please enter a skill')
      return
    }

    if (formData.skills.includes(skill)) {
      setError('This skill is already added')
      return
    }

    if (formData.skills.length >= 10) {
      setError('Maximum 10 skills allowed')
      return
    }

    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skill]
    }))
    setSkillInput('')
    setError(null)
  }

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }))
  }

  const addRole = () => {
    if (!roleInput) {
      setError('Please select a role')
      return
    }

    if (formData.rolesNeeded.includes(roleInput)) {
      setError('This role is already added')
      return
    }

    if (formData.rolesNeeded.length >= 6) {
      setError('Maximum 6 roles allowed')
      return
    }

    setFormData(prev => ({
      ...prev,
      rolesNeeded: [...prev.rolesNeeded, roleInput]
    }))
    setRoleInput('')
    setError(null)
  }

  const removeRole = (roleToRemove) => {
    setFormData(prev => ({
      ...prev,
      rolesNeeded: prev.rolesNeeded.filter(r => r !== roleToRemove)
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Project title is required')
      return false
    }

    if (formData.title.length < 5 || formData.title.length > 100) {
      setError('Title must be between 5 and 100 characters')
      return false
    }

    if (!formData.description.trim()) {
      setError('Project description is required')
      return false
    }

    if (formData.description.length < 20 || formData.description.length > 1000) {
      setError('Description must be between 20 and 1000 characters')
      return false
    }

    if (!formData.githubUrl.trim()) {
      setError('GitHub URL is required')
      return false
    }

    try {
      new URL(formData.githubUrl)
    } catch (err) {
      setError('Please enter a valid GitHub URL')
      return false
    }

    if (!formData.groupLink.trim()) {
      setError('Group link is required')
      return false
    }

    try {
      new URL(formData.groupLink)
    } catch (err) {
      setError('Please enter a valid group link URL')
      return false
    }

    if (!formData.groupType) {
      setError('Group type is required')
      return false
    }

    if (formData.skills.length === 0) {
      setError('At least one skill is required')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
          Project Title <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., E-commerce Platform"
            minLength={5}
            maxLength={100}
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100 text-sm"
          />
          <span className="absolute right-3 top-2.5 text-xs text-slate-500">
            {formData.title.length}/100
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
          Description <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your project in detail..."
            minLength={20}
            maxLength={1000}
            rows={5}
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100 text-sm resize-none"
          />
          <span className="absolute right-3 bottom-2.5 text-xs text-slate-500">
            {formData.description.length}/1000
          </span>
        </div>
      </div>

      {/* GitHub URL */}
      <div>
        <label htmlFor="githubUrl" className="block text-sm font-medium text-slate-700 mb-2">
          GitHub Repository URL <span className="text-red-600">*</span>
        </label>
        <input
          id="githubUrl"
          type="url"
          name="githubUrl"
          value={formData.githubUrl}
          onChange={handleChange}
          placeholder="https://github.com/username/repo"
          disabled={isSubmitting}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="groupType" className="block text-sm font-medium text-slate-700 mb-2">
            Communication Group Type <span className="text-red-600">*</span>
          </label>
          <select
            id="groupType"
            name="groupType"
            value={formData.groupType}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100 text-sm"
          >
            <option value="">Select group type</option>
            {groupTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Group Link */}
        <div>
          <label htmlFor="groupLink" className="block text-sm font-medium text-slate-700 mb-2">
            Group Link <span className="text-red-600">*</span>
          </label>
          <input
            id="groupLink"
            type="url"
            name="groupLink"
            value={formData.groupLink}
            onChange={handleChange}
            placeholder="https://chat.whatsapp.com/... or https://discord.gg/..."
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="projectType" className="block text-sm font-medium text-slate-700 mb-2">
            Project Type <span className="text-xs text-slate-500">(Cannot change)</span>
          </label>
          <div className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 text-sm flex items-center font-medium">
            {formData.projectType}
          </div>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
            Status <span className="text-xs text-slate-500">(Cannot change)</span>
          </label>
          <div className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 text-sm flex items-center font-medium capitalize">
            {formData.status}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Status changes based on project activity
          </p>
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Skills Required <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="e.g., React"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100 text-sm"
          />
          <button
            type="button"
            onClick={addSkill}
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium text-sm"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.skills.map(skill => (
            <span
              key={skill}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                disabled={isSubmitting}
                className="hover:text-blue-900 disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {formData.skills.length}/10 skills
        </p>
      </div>

      {/* Roles Needed */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Roles Needed (Optional)
        </label>
        <div className="flex gap-2 mb-3">
          <select
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100 text-sm"
          >
            <option value="">Select a role...</option>
            {roles.map(role => (
              <option key={role} value={role}>
                {roleNames[role]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addRole}
            disabled={isSubmitting || !roleInput}
            className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 font-medium text-sm"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.rolesNeeded.map(role => (
            <span
              key={role}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2"
            >
              {roleNames[role]}
              <button
                type="button"
                onClick={() => removeRole(role)}
                disabled={isSubmitting}
                className="hover:text-purple-900 disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {formData.rolesNeeded.length}/6 roles
        </p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Editable:</span> Title, Description, GitHub URL, Group Link, Group Type, Skills, Roles
        </p>
        <p className="text-sm text-blue-900 mt-1">
          <span className="font-semibold">Read-only:</span> Project Type, Status
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting && <Loader size={18} className="animate-spin" />}
        <span>{isSubmitting ? 'Updating...' : 'Update Project'}</span>
      </button>
    </form>
  )
}

export default EditProjectPage