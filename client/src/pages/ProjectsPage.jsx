import { useState, useEffect } from 'react'
import { projectAPI } from '../services/api'
import { Search, Filter, AlertCircle, Loader } from 'lucide-react'
import ProjectCard from '../components/ProjectCard'

const ProjectsPage = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filters
  const [filters, setFilters] = useState({
    skill: '',
    type: '',
    status: ''
  })

  // Fetch projects
  useEffect(() => {
    fetchProjects()
  }, [page, filters])

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query params
      const params = {
        page: page,
        limit: 12
      }

      if (filters.skill) params.skill = filters.skill
      if (filters.type) params.type = filters.type
      if (filters.status) params.status = filters.status

      // Call API
      const response = await projectAPI.getAll(params)

      if (response.data.success) {
        setProjects(response.data.data)
        setTotalPages(response.data.pagination.pages)
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch projects. Please try again.'
      )
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setPage(1)
  }

  const handleResetFilters = () => {
    setFilters({
      skill: '',
      type: '',
      status: ''
    })
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Projects</h1>
          <p className="text-lg text-slate-600">
            Discover real-world projects and find your team
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skill
              </label>
              <input
                type="text"
                name="skill"
                value={filters.skill}
                onChange={handleFilterChange}
                placeholder="e.g., React"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Types</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Finalyear-Project">Final Year Project</option>
                <option value="Startup">Startup</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Status</option>
                <option value="recruiting">Recruiting</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition font-medium text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error loading projects</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading projects...</p>
            </div>
          </div>
        ) : (
          <>
            {projects.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {projects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-2 rounded-lg transition font-medium text-sm ${
                            page === p
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* No Projects */
              <div className="text-center py-20">
                <Search size={40} className="text-slate-400 mx-auto mb-4" />
                <p className="text-lg text-slate-600 mb-2">No projects found</p>
                <p className="text-slate-500">Try adjusting your filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProjectsPage