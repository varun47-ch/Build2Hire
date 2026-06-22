import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { projectAPI, joinRequestAPI } from '../services/api'
import {
  AlertCircle,
  Loader,
  Plus,
  Briefcase,
  Users,
  MessageSquare,
  ArrowRight,
  Trash2,
  Edit2,
  X
} from 'lucide-react'

const StudentDashboardPage = () => {
  const navigate = useNavigate()
  const { user, isAuth } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [myProjects, setMyProjects] = useState([])
  const [myTeams, setMyTeams] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    projectId: null,
    projectTitle: '',
    isDeleting: false
  })

  useEffect(() => {
    if (!isAuth) {
      navigate('/login')
      return
    }
    fetchData()
  }, [isAuth, navigate])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all projects
      const projectsRes = await projectAPI.getAll({ limit: 100 })

      if (projectsRes.data.success) {
        const allProjects = projectsRes.data.data

        // My Projects (created by me)
        const created = allProjects.filter(
          p => p.createdBy._id === user._id
        )
        setMyProjects(created)

        // My Teams (joined as member)
        const joined = allProjects.filter(p =>
          p.members.some(m => m._id === user._id || m === user._id)
        )
        setMyTeams(joined)
      }

      // Fetch pending requests
      const requestsRes = await joinRequestAPI.getMyRequests()
      if (requestsRes.data.success) {
        const pending = requestsRes.data.data.filter(
          r => r.status === 'pending'
        )
        setPendingRequests(pending)
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load dashboard'
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle Delete
  const handleDeleteProject = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }))

    try {
      const response = await projectAPI.delete(deleteModal.projectId)

      if (response.data.success) {
        setMyProjects(prev =>
          prev.filter(p => p._id !== deleteModal.projectId)
        )
        setDeleteModal({
          isOpen: false,
          projectId: null,
          projectTitle: '',
          isDeleting: false
        })
      }
    } catch (err) {
      alert('Failed to delete project: ' + (err.response?.data?.message || 'Unknown error'))
    } finally {
      setDeleteModal(prev => ({ ...prev, isDeleting: false }))
    }
  }

  // Open Delete Modal
  const openDeleteModal = (projectId, projectTitle) => {
    setDeleteModal({
      isOpen: true,
      projectId,
      projectTitle,
      isDeleting: false
    })
  }

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      projectId: null,
      projectTitle: '',
      isDeleting: false
    })
  }

  if (!isAuth) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error loading dashboard</p>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Manage your projects and teams
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 sm:mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Projects Created
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {myProjects.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Teams Joined
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {myTeams.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Pending Requests
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {pendingRequests.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageSquare size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Members
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {myTeams.reduce((acc, team) => acc + team.members.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 sm:mb-12">
          <button
            onClick={() => navigate('/create-project')}
            className="bg-blue-600 text-white rounded-lg py-3 px-4 sm:px-6 hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus size={20} />
            New Project
          </button>
          <button
            onClick={() => navigate('/my-requests')}
            className="bg-slate-200 text-slate-900 rounded-lg py-3 px-4 sm:px-6 hover:bg-slate-300 transition font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <MessageSquare size={20} />
            My Requests
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="bg-slate-200 text-slate-900 rounded-lg py-3 px-4 sm:px-6 hover:bg-slate-300 transition font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Briefcase size={20} />
            Explore
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  My Projects
                </h2>
                {myProjects.length > 0 && (
                  <button
                    onClick={() => navigate('/projects')}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
                  >
                    View All <ArrowRight size={16} />
                  </button>
                )}
              </div>

              {myProjects.length > 0 ? (
                <div className="space-y-4">
                  {myProjects.slice(0, 3).map(project => (
                    <div
                      key={project._id}
                      className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2">
                            {project.title}
                          </h3>
                          <p className="text-slate-600 text-xs sm:text-sm mt-1">
                            {project.members.length} members
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                          project.status === 'recruiting'
                            ? 'bg-green-100 text-green-700'
                            : project.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {project.status}
                        </span>
                      </div>

                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-4">
                        {project.description}
                      </p>

                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {project.skills.slice(0, 3).map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {project.skills.length > 3 && (
                          <span className="px-2 py-1 text-xs text-slate-600">
                            +{project.skills.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-200 flex-wrap">
                        <button
                          onClick={() => navigate(`/projects/${project._id}`)}
                          className="flex-1 min-w-[80px] px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold text-xs sm:text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/projects/${project._id}/requests`)}
                          className="flex-1 min-w-[80px] px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition font-semibold text-xs sm:text-sm"
                        >
                          Requests
                        </button>
                        <button
                          onClick={() => navigate(`/edit-project/${project._id}`)}
                          className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1"
                          title="Edit project"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(project._id, project.title)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1"
                          title="Delete project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <Briefcase size={48} className="text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium mb-4">
                    No projects created yet
                  </p>
                  <button
                    onClick={() => navigate('/create-project')}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    Create your first project
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            {/* My Teams */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                My Teams
              </h2>

              {myTeams.length > 0 ? (
                <div className="space-y-3">
                  {myTeams.slice(0, 3).map(team => (
                    <div
                      key={team._id}
                      className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition"
                    >
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                        {team.title}
                      </h3>
                      <p className="text-slate-600 text-xs mt-1">
                        {team.members.length} members
                      </p>
                      <button
                        onClick={() => navigate(`/projects/${team._id}`)}
                        className="text-blue-600 hover:text-blue-700 text-xs font-semibold mt-2"
                      >
                        View Team →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
                  <Users size={36} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm font-medium">
                    No teams joined
                  </p>
                </div>
              )}
            </div>

            {/* Pending Requests */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                Pending
              </h2>

              {pendingRequests.length > 0 ? (
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map(req => (
                    <div
                      key={req._id}
                      className="bg-yellow-50 rounded-lg border border-yellow-200 p-4"
                    >
                      <p className="font-semibold text-slate-900 text-sm line-clamp-1">
                        {req.projectId?.title || 'Project'}
                      </p>
                      <p className="text-slate-600 text-xs mt-1 capitalize">
                        {req.role}
                      </p>
                      <div className="text-yellow-700 text-xs mt-2 font-medium">
                        ⏳ Waiting...
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length > 3 && (
                    <button
                      onClick={() => navigate('/my-requests')}
                      className="w-full text-blue-600 hover:text-blue-700 font-semibold text-sm py-2"
                    >
                      View All ({pendingRequests.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
                  <MessageSquare size={36} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm font-medium">
                    No pending requests
                  </p>
                </div>
              )}
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
                  Are you sure you want to delete <span className="font-bold">"{deleteModal.projectTitle}"</span>?
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
      </div>
    </div>
  )
}

export default StudentDashboardPage