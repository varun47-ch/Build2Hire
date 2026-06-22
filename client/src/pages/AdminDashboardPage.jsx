import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { projectAPI, adminAPI } from '../services/api'
import UsersManagementTab from '../components/UsersManagementTab'
import ProjectModerationTab from '../components/ProjectModerationTab'
import CompaniesModerationTab from '../components/CompaniesModerationTab'
import {
  AlertCircle,
  Loader,
  Users,
  UserCheck,
  Briefcase,
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  Layout,
  Building2
} from 'lucide-react'

const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { user, isAuth } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Stats
  const [totalUsers, setTotalUsers] = useState(0)
  const [studentCount, setStudentCount] = useState(0)
  const [hrCount, setHrCount] = useState(0)
  const [totalProjects, setTotalProjects] = useState(0)

  // Project status breakdown
  const [recruitingProjects, setRecruitingProjects] = useState(0)
  const [inProgressProjects, setInProgressProjects] = useState(0)
  const [completedProjects, setCompletedProjects] = useState(0)

  // Recent activity
  const [recentUsers, setRecentUsers] = useState([])
  const [recentProjects, setRecentProjects] = useState([])

  useEffect(() => {
    if (!isAuth || user?.role !== 'Admin') {
      navigate('/login')
      return
    }
    fetchAdminData()
  }, [isAuth, user, navigate])

  const fetchAdminData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all users
      const allUsersRes = await adminAPI.getAllUsers({ limit: 1000 })
      if (allUsersRes.data.success) {
        setTotalUsers(allUsersRes.data.pagination.totalRecords)

        const users = allUsersRes.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        setRecentUsers(users.slice(0, 5))
      }

      // Fetch student count
      const studentsRes = await adminAPI.getAllUsers({ role: 'Student', limit: 1000 })
      if (studentsRes.data.success) {
        setStudentCount(studentsRes.data.pagination.totalRecords)
      }

      // Fetch HR count
      const hrsRes = await adminAPI.getAllUsers({ role: 'Hr', limit: 1000 })
      if (hrsRes.data.success) {
        setHrCount(hrsRes.data.pagination.totalRecords)
      }

      // Fetch all projects
      const projectsRes = await projectAPI.getAll({ limit: 1000 })
      if (projectsRes.data.success) {
        const projects = projectsRes.data.data
        setTotalProjects(projects.length)

        setRecruitingProjects(projects.filter(p => p.status === 'recruiting').length)
        setInProgressProjects(projects.filter(p => p.status === 'in-progress').length)
        setCompletedProjects(projects.filter(p => p.status === 'completed').length)

        const sorted = [...projects].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        setRecentProjects(sorted.slice(0, 5))
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data')
      console.error('Fetch admin data error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading && activeTab === 'overview') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error loading dashboard</p>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchAdminData}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Layout size={24} className="text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base">
            Platform overview and management
          </p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={18} />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={18} />
              Users Management
            </div>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Briefcase size={18} />
              Projects Moderation
            </div>
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
              activeTab === 'companies'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 size={18} />
              Companies Verification
            </div>
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Users */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {totalUsers}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Total Students */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Students</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {studentCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck size={24} className="text-green-600" />
                  </div>
                </div>
              </div>

              {/* Total HR */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">
                      HR / Companies
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {hrCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Briefcase size={24} className="text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Total Projects */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Projects</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {totalProjects}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 size={24} className="text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                Project Status Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Recruiting */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-blue-900">
                      Recruiting
                    </h4>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">📋</span>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-blue-900">
                    {recruitingProjects}
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    {((recruitingProjects / Math.max(totalProjects, 1)) * 100).toFixed(1)}%
                  </p>
                </div>

                {/* In Progress */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border border-amber-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-amber-900">
                      In Progress
                    </h4>
                    <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">⚡</span>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-amber-900">
                    {inProgressProjects}
                  </p>
                  <p className="text-sm text-amber-700 mt-2">
                    {((inProgressProjects / Math.max(totalProjects, 1)) * 100).toFixed(1)}%
                  </p>
                </div>

                {/* Completed */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-green-900">
                      Completed
                    </h4>
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-green-900">
                    {completedProjects}
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    {((completedProjects / Math.max(totalProjects, 1)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-blue-600" />
                  Recent Joiners
                </h3>

                {recentUsers.length > 0 ? (
                  <div className="space-y-3">
                    {recentUsers.map(user => (
                      <div
                        key={user._id}
                        className="flex items-start justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">
                            {user.name}
                          </h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {user.role}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                              user.role === 'Student'
                                ? 'bg-green-600'
                                : user.role === 'Hr'
                                ? 'bg-purple-600'
                                : 'bg-blue-600'
                            }`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users size={40} className="text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 text-sm">No recent users</p>
                  </div>
                )}
              </div>

              {/* Recent Projects */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600" />
                  Recent Projects
                </h3>

                {recentProjects.length > 0 ? (
                  <div className="space-y-3">
                    {recentProjects.map(project => (
                      <div
                        key={project._id}
                        className="flex items-start justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 line-clamp-1">
                            {project.title}
                          </h4>
                          <p className="text-sm text-slate-600 mt-1">
                            by {project.createdBy?.name || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                project.status === 'recruiting'
                                  ? 'bg-blue-100 text-blue-700'
                                  : project.status === 'in-progress'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {project.status.replace('-', ' ')}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatDate(project.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-semibold">
                            {project.members.length + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase size={40} className="text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 text-sm">No recent projects</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* USERS MANAGEMENT TAB */}
        {activeTab === 'users' && <UsersManagementTab />}

        {/* PROJECTS MODERATION TAB */}
        {activeTab === 'projects' && <ProjectModerationTab />}

        {/* COMPANIES VERIFICATION TAB */}
        {activeTab === 'companies' && <CompaniesModerationTab />}
      </div>
    </div>
  )
}

export default AdminDashboardPage