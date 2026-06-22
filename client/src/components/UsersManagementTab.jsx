import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import {
  Search,
  Filter,
  Loader,
  AlertCircle,
  Eye,
  Power,
  X,
  AlertTriangle,
  Users,
  CheckCircle,
  XCircle,
  Mail
} from 'lucide-react'

const UsersManagementTab = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // View User Modal
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    user: null
  })

  // Deactivate/Activate Modal
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    userId: null,
    userName: null,
    currentStatus: null
  })

  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await adminAPI.getAllUsers({ limit: 1000 })
      if (response.data.success) {
        setUsers(response.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users')
      console.error('Fetch users error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = !roleFilter || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  // Opens profile modal
  const handleViewUser = (user) => {
    setViewModal({
      isOpen: true,
      user: user
    })
  }

  //Opens deactivate/activate confirmation
  const handleStatusToggle = (user) => {
    setStatusModal({
      isOpen: true,
      userId: user._id,
      userName: user.name,
      currentStatus: user.isActive
    })
  }

  // Confirm status change (deactivate/activate)
  const handleConfirmStatusChange = async () => {
    setProcessingId(statusModal.userId)
    const newStatus = !statusModal.currentStatus

    try {
      const response = await adminAPI.updateUserStatus(statusModal.userId, {
        isActive: newStatus
      })

      if (response.data.success) {
        setUsers(
          users.map(u =>
            u._id === statusModal.userId ? { ...u, isActive: newStatus } : u
          )
        )

        setStatusModal({
          isOpen: false,
          userId: null,
          userName: null,
          currentStatus: null
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status')
      console.error('Update user status error:', err)
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Student':
        return 'bg-green-100 text-green-700'
      case 'Hr':
        return 'bg-purple-100 text-purple-700'
      case 'Admin':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader size={40} className="text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Loading users...</p>
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
              onClick={fetchUsers}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Users
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
                placeholder="Name or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by Role
            </label>
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-3 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
              >
                <option value="">All Roles</option>
                <option value="Student">Student</option>
                <option value="Hr">HR / Company</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          Showing <span className="font-semibold">{paginatedUsers.length}</span> of{' '}
          <span className="font-semibold">{filteredUsers.length}</span> users
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {paginatedUsers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedUsers.map(user => (
                    <tr key={user._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.isActive ? (
                          <span className="flex items-center gap-2 text-green-700 font-medium">
                            <CheckCircle size={16} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-700 font-medium">
                            <XCircle size={16} />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View profile"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleStatusToggle(user)}
                            disabled={processingId === user._id}
                            className={`p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                              user.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {processingId === user._id ? (
                              <Loader size={18} className="animate-spin" />
                            ) : (
                              <Power size={18} />
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
            <Users size={48} className="text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No users found</p>
          </div>
        )}
      </div>

      {viewModal.isOpen && viewModal.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <h2 className="text-xl font-bold text-slate-900">User Profile</h2>
              <button
                onClick={() => setViewModal({ isOpen: false, user: null })}
                className="p-1 hover:bg-white rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-xl ${
                    viewModal.user.role === 'Student'
                      ? 'bg-green-600'
                      : viewModal.user.role === 'Hr'
                      ? 'bg-purple-600'
                      : 'bg-blue-600'
                  }`}
                >
                  {viewModal.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {viewModal.user.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                    <Mail size={14} />
                    {viewModal.user.email}
                  </div>
                </div>
              </div>
              <div className="h-px bg-slate-200" />

              {/* Role & Status */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600 font-semibold">Role</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                      viewModal.user.role
                    )}`}
                  >
                    {viewModal.user.role}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600 font-semibold">Status</p>
                  {viewModal.user.isActive ? (
                    <span className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                      <CheckCircle size={16} />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-red-700 font-semibold text-sm">
                      <XCircle size={16} />
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              {/* Joined Date */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-600 font-semibold mb-2">
                  Member Since
                </p>
                <p className="text-base font-bold text-slate-900">
                  {formatDate(viewModal.user.createdAt)}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setViewModal({ isOpen: false, user: null })}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition font-semibold text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewModal({ isOpen: false, user: null })
                    handleStatusToggle(viewModal.user)
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition font-semibold text-sm text-white ${
                    viewModal.user.isActive
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {viewModal.user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {statusModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${
                    statusModal.currentStatus ? 'bg-red-100' : 'bg-green-100'
                  } rounded-lg flex items-center justify-center`}
                >
                  <AlertTriangle
                    size={20}
                    className={
                      statusModal.currentStatus ? 'text-red-600' : 'text-green-600'
                    }
                  />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {statusModal.currentStatus ? 'Deactivate' : 'Activate'} User
                </h2>
              </div>
              <button
                onClick={() =>
                  setStatusModal({
                    isOpen: false,
                    userId: null,
                    userName: null,
                    currentStatus: null
                  })
                }
                className="p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <p className="text-slate-700">
                Are you sure you want to{' '}
                <span className="font-semibold">
                  {statusModal.currentStatus ? 'deactivate' : 'activate'}
                </span>{' '}
                this user?
              </p>

              <div
                className={`${
                  statusModal.currentStatus ? 'bg-red-50' : 'bg-green-50'
                } border ${
                  statusModal.currentStatus ? 'border-red-200' : 'border-green-200'
                } rounded-lg p-4`}
              >
                <p
                  className={`text-sm font-semibold ${
                    statusModal.currentStatus
                      ? 'text-red-900'
                      : 'text-green-900'
                  }`}
                >
                  {statusModal.userName}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    statusModal.currentStatus ? 'text-red-700' : 'text-green-700'
                  }`}
                >
                  {statusModal.currentStatus
                    ? 'User will no longer have access to the platform'
                    : 'User will regain access to the platform'}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() =>
                    setStatusModal({
                      isOpen: false,
                      userId: null,
                      userName: null,
                      currentStatus: null
                    })
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  disabled={processingId === statusModal.userId}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    statusModal.currentStatus
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {processingId === statusModal.userId && (
                    <Loader size={16} className="animate-spin" />
                  )}
                  <span>
                    {statusModal.currentStatus ? 'Deactivate' : 'Activate'} User
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersManagementTab