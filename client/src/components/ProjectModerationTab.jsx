import { useState, useEffect } from 'react'
import { projectAPI } from '../services/api'
import {
  Search,
  Filter,
  Loader,
  AlertCircle,
  Eye,
  Trash2,
  X,
  AlertTriangle,
  ExternalLink,
  Users,
  Briefcase,
  Calendar,
  Code,
  User
} from 'lucide-react'

const ProjectModerationTab = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // View Project Modal
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    project: null
  })

  // Delete Project Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    projectId: null,
    projectTitle: null
  })

  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await projectAPI.getAll({ limit: 1000 })
      if (response.data.success) {
        setProjects(response.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects')
      console.error('Fetch projects error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || project.status === statusFilter
    const matchesType = !typeFilter || project.projectType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage)

  // VIEW PROJECT
  const handleViewProject = (project) => {
    setViewModal({
      isOpen: true,
      project: project
    })
  }

  //  DELETE PROJECT 
  const handleDeleteClick = (project) => {
    setDeleteModal({
      isOpen: true,
      projectId: project._id,
      projectTitle: project.title
    })
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    setDeletingId(deleteModal.projectId)

    try {
      await projectAPI.delete(deleteModal.projectId)

      setProjects(projects.filter(p => p._id !== deleteModal.projectId))

      setDeleteModal({
        isOpen: false,
        projectId: null,
        projectTitle: null
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project')
      console.error('Delete project error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'recruiting':
        return 'bg-blue-100 text-blue-700'
      case 'in-progress':
        return 'bg-amber-100 text-amber-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'Hackathon':
        return 'bg-purple-100 text-purple-700'
      case 'Finalyear-Project':
        return 'bg-indigo-100 text-indigo-700'
      case 'Startup':
        return 'bg-pink-100 text-pink-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader size={40} className="text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Projects
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Title or description..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by Status
            </label>
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-3 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
              >
                <option value="">All Status</option>
                <option value="recruiting">Recruiting</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by Type
            </label>
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-3 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
              >
                <option value="">All Types</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Finalyear-Project">Final Year Project</option>
                <option value="Startup">Startup</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          Showing <span className="font-semibold">{paginatedProjects.length}</span> of{' '}
          <span className="font-semibold">{filteredProjects.length}</span> projects
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {paginatedProjects.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Project Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Creator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedProjects.map(project => (
                    <tr key={project._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 max-w-xs line-clamp-2">
                        {project.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {project.createdBy?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                            project.status
                          )}`}
                        >
                          {project.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(
                            project.projectType
                          )}`}
                        >
                          {project.projectType === 'Finalyear-Project'
                            ? 'Final Year'
                            : project.projectType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {project.members.length + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(project.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewProject(project)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View project details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(project)}
                            disabled={deletingId === project._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete project"
                          >
                            {deletingId === project._id ? (
                              <Loader size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Page <span className="font-semibold">{currentPage}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <ExternalLink size={48} className="text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No projects found</p>
          </div>
        )}
      </div>

      {viewModal.isOpen && viewModal.project && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <h2 className="text-2xl font-bold text-slate-900">Project Details</h2>
              <button
                onClick={() => setViewModal({ isOpen: false, project: null })}
                className="p-1 hover:bg-white rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title & Badges */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {viewModal.project.title}
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                      viewModal.project.status
                    )}`}
                  >
                    {viewModal.project.status.replace('-', ' ')}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(
                      viewModal.project.projectType
                    )}`}
                  >
                    {viewModal.project.projectType === 'Finalyear-Project'
                      ? 'Final Year'
                      : viewModal.project.projectType}
                  </span>
                </div>
              </div>

              {/* Creator Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 font-semibold mb-2">
                  <User size={14} className="inline mr-2" />
                  Created by
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {viewModal.project.createdBy?.name || 'Unknown'}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {viewModal.project.createdBy?.email}
                </p>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Description
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-4">
                  {viewModal.project.description}
                </p>
              </div>

              {/* GitHub URL */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Code size={16} />
                  GitHub Repository
                </h4>
                <a
                  href={viewModal.project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium break-all"
                >
                  {viewModal.project.githubUrl}
                </a>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                    <Users size={16} />
                    Team Size
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {viewModal.project.members.length + 1}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Created Date
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatDate(viewModal.project.createdAt)}
                  </p>
                </div>
              </div>

              {/* Skills */}
              {viewModal.project.skills && viewModal.project.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewModal.project.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Roles Needed */}
              {viewModal.project.rolesNeeded && viewModal.project.rolesNeeded.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    Roles Needed
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewModal.project.rolesNeeded.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Members */}
              {viewModal.project.members.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    Team Members ({viewModal.project.members.length})
                  </h4>
                  <div className="space-y-2">
                    {viewModal.project.members.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {member.name}
                          </p>
                          <p className="text-xs text-slate-600">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="border-t border-slate-200 pt-6">
                <button
                  onClick={() => setViewModal({ isOpen: false, project: null })}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Delete Project</h2>
              </div>
              <button
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    projectId: null,
                    projectTitle: null
                  })
                }
                className="p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-700">
                Are you sure you want to <span className="font-semibold">permanently delete</span>{' '}
                this project? This action cannot be undone.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900 font-semibold">
                  📁 {deleteModal.projectTitle}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 space-y-2">
                <p className="font-semibold">⚠️ This will:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Remove the project from the platform</li>
                  <li>Delete all join requests for this project</li>
                  <li>Remove team members association</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() =>
                    setDeleteModal({
                      isOpen: false,
                      projectId: null,
                      projectTitle: null
                    })
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deletingId === deleteModal.projectId}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === deleteModal.projectId && (
                    <Loader size={16} className="animate-spin" />
                  )}
                  <span>Delete Project</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectModerationTab