import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { projectAPI } from '../services/api'
import {
  ArrowLeft,
  Calendar,
  Users,
  Code2,
  AlertCircle,
  Loader,
  MessageCircle,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  GitBranch,
  Code,
  Briefcase
} from 'lucide-react'
import JoinRequestModal from '../components/JoinRequestModal'

const ProjectDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuth } = useAuth()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joined, setJoined] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState(null)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isDeleting: false
  })

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await projectAPI.getById(id)

      if (response.data.success) {
        setProject(response.data.data)

        if (isAuth && user) {
          const isMember = response.data.data.members.some(
            (member) => member._id === user._id || member === user._id
          )
          setJoined(isMember)
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load project details'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSuccess = () => {
    setJoined(true)
    fetchProject()
  }

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Mark project as "${newStatus}"?`)) {
      return
    }

    setStatusLoading(true)
    setStatusError(null)

    try {
      const response = await projectAPI.update(id, {
        status: newStatus
      })

      if (response.data.success) {
        setProject(prev => ({
          ...prev,
          status: newStatus
        }))
        alert(`Project marked as ${newStatus}!`)
      }
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }))

    try {
      const response = await projectAPI.delete(id)

      if (response.data.success) {
        alert('Project deleted successfully!')
        navigate('/student-dashboard')
      }
    } catch (err) {
      alert('Failed to delete project: ' + (err.response?.data?.message || 'Unknown error'))
    } finally {
      setDeleteModal(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const openDeleteModal = () => {
    setDeleteModal({
      isOpen: true,
      isDeleting: false
    })
  }

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      isDeleting: false
    })
  }

  const getRoleColor = (role) => {
    const colors = {
      frontend: 'bg-blue-100 text-blue-700',
      backend: 'bg-purple-100 text-purple-700',
      ml: 'bg-orange-100 text-orange-700',
      designer: 'bg-pink-100 text-pink-700',
      devops: 'bg-red-100 text-red-700',
      other: 'bg-slate-100 text-slate-700'
    }
    return colors[role] || colors.other
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Projects
          </button>

          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <AlertCircle size={40} className="text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Project Not Found
            </h1>
            <p className="text-slate-600 mb-6">
              {error || 'The project you are looking for does not exist.'}
            </p>
            <button
              onClick={() => navigate('/projects')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Return to Projects
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isProjectHead =
    isAuth && user && project.createdBy && project.createdBy._id === user._id
  const canJoin = isAuth && !joined && !isProjectHead

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </button>
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
                <p className="text-blue-100">{project.description}</p>
              </div>
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-slate-500 bg-opacity-20 rounded-full text-sm font-semibold">
                  {project.projectType}
                </span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    project.status === 'recruiting'
                      ? 'bg-green-500 bg-opacity-20'
                      : project.status === 'in-progress'
                      ? 'bg-yellow-500 bg-opacity-20'
                      : 'bg-slate-500 bg-opacity-20'
                  }`}
                >
                  {project.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Calendar
                  className="text-blue-600 flex-shrink-0 mt-1"
                  size={20}
                />
                <div>
                  <p className="text-sm font-medium text-slate-700">Created</p>
                  <p className="text-slate-900 font-semibold">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-slate-700">Team Size</p>
                  <p className="text-slate-900 font-semibold">
                    {project.members.length + 1} members
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Code2 className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-slate-700">Tech Stack</p>
                  <p className="text-slate-900 font-semibold">
                    {project.skills.length} technologies
                  </p>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="border-t border-slate-200 pt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-3">
                {project.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Roles Needed Section */}
            {project.rolesNeeded && project.rolesNeeded.length > 0 && (
              <div className="border-t border-slate-200 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase size={24} className="text-purple-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Roles Needed</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {project.rolesNeeded.map((role) => (
                    <span
                      key={role}
                      className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${getRoleColor(role)}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub Repository Section */}
            {project.githubUrl && (
              <div className="border-t border-slate-200 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <Code size={24} className="text-slate-900" />
                  <h2 className="text-2xl font-bold text-slate-900">Repository</h2>
                </div>
                <a
                
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition"
                >
                  <Code size={18} />
                  View on GitHub
                </a>
                <p className="text-slate-600 text-sm mt-3">{project.githubUrl}</p>
              </div>
            )}

            {/* Status Management - Project Head Only */}
            {isProjectHead && (
              <div className="border-t border-slate-200 pt-8">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Project Status
                  </h3>

                  {statusError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{statusError}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mb-4">
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                        project.status === 'recruiting'
                          ? 'bg-green-100 text-green-700'
                          : project.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {project.status === 'recruiting' && <Clock size={16} />}
                      {project.status === 'in-progress' && <Clock size={16} />}
                      {project.status === 'completed' && (
                        <CheckCircle2 size={16} />
                      )}
                      Current: {project.status}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {project.status === 'recruiting' && (
                      <button
                        onClick={() => handleStatusChange('in-progress')}
                        disabled={statusLoading}
                        className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        {statusLoading ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Clock size={16} />
                        )}
                        Mark as In Progress
                      </button>
                    )}

                    {project.status === 'in-progress' && (
                      <button
                        onClick={() => handleStatusChange('completed')}
                        disabled={statusLoading}
                        className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        {statusLoading ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Mark as Completed
                      </button>
                    )}

                    {project.status === 'completed' && (
                      <button
                        onClick={() => handleStatusChange('in-progress')}
                        disabled={statusLoading}
                        className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        {statusLoading ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Clock size={16} />
                        )}
                        Reopen Project
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-4">
                    💡 Only project head can change status. Changes are permanent.
                  </p>
                </div>
              </div>
            )}

            {/* Team Section */}
            <div className="border-t border-slate-200 pt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Team Members
              </h2>

              {/* Project Head */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Project Head
                </p>
                {project.createdBy ? (
                  <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-200 p-4">
                    <h3 className="font-semibold text-slate-900">
                      {project.createdBy.name}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {project.createdBy.email}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      Project Head
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-600">Loading...</div>
                )}
              </div>

              {/* View Requests Button (for Project Head) */}
              {isProjectHead && (
                <div className="mb-6">
                  <button
                    onClick={() => navigate(`/projects/${project._id}/requests`)}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                  >
                    <MessageCircle size={18} />
                    View Join Requests
                  </button>
                </div>
              )}

              {/* Team Members */}
              {project.members.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Team Members ({project.members.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.members.map((member) => (
                      <div
                        key={member._id || member}
                        className="bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 p-4"
                      >
                        <h3 className="font-semibold text-slate-900">
                          {typeof member === 'string'
                            ? 'Member'
                            : member.name || 'Loading...'}
                        </h3>
                        {typeof member !== 'string' && (
                          <p className="text-slate-600 text-sm">
                            {member.email}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {project.members.length === 0 && (
                <p className="text-slate-600">
                  No team members yet. Be the first to join!
                </p>
              )}
            </div>

            {/* Join Request Info */}
            {project.status === 'recruiting' && !isProjectHead && (
              <div className="border-t border-slate-200 pt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
                <p className="text-slate-700 mb-4">
                  This project is actively recruiting. Send a join request to
                  express your interest!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-8 py-6 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              {isProjectHead && (
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-blue-600">
                    You are the project head
                  </span>
                </p>
              )}
              {joined && !isProjectHead && (
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-green-600">
                    ✓ You are a team member
                  </span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              {/* Project Head Actions */}
              {isProjectHead && (
                <>
                  <button
                    onClick={() => navigate(`/edit-project/${project._id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={openDeleteModal}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </>
              )}

              {/* Join Request */}
              {canJoin && project.status === 'recruiting' && (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                >
                  <MessageCircle size={16} />
                  Send Join Request
                </button>
              )}

              {/* Login */}
              {!isAuth && (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                >
                  Login to Join
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Delete Project</h2>
              <button
                onClick={closeDeleteModal}
                className="p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-slate-700 mb-4">
                Are you sure you want to delete <span className="font-bold">"{project.title}"</span>?
              </p>
              <p className="text-sm text-slate-600 mb-6">
                This action cannot be undone. All project data, team members, and requests will be permanently deleted.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleteModal.isDeleting}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={deleteModal.isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleteModal.isDeleting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Request Modal */}
      {showJoinModal && (
        <JoinRequestModal
          projectId={project._id}
          onClose={() => setShowJoinModal(false)}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  )
}

export default ProjectDetailPage