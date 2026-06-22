import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { joinRequestAPI } from '../services/api'
import { ArrowLeft, AlertCircle, Loader, MessageSquare, CheckCircle, XCircle } from 'lucide-react'

const MyRequestsPage = () => {
  const navigate = useNavigate()
  const { isAuth } = useAuth()

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAuth) {
      navigate('/login')
      return
    }
    fetchRequests()
  }, [isAuth, navigate])

  const fetchRequests = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await joinRequestAPI.getMyRequests()

      if (response.data.success) {
        setRequests(response.data.data)
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load requests'
      setError(message)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your requests...</p>
        </div>
      </div>
    )
  }

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

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare size={36} className="text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-slate-900">My Requests</h1>
              <p className="text-slate-600">
                Track requests you've sent to projects
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error loading requests</p>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchRequests}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <MessageSquare size={48} className="text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No requests yet
            </h2>
            <p className="text-slate-600 mb-8">
              Browse projects and send join requests to teams you're interested in
            </p>
            <button
              onClick={() => navigate('/projects')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Explore Projects
            </button>
          </div>
        ) : (
          <>
            {/* Pending Requests */}
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Waiting for Response
                </h2>
                <div className="space-y-4">
                  {requests
                    .filter(r => r.status === 'pending')
                    .map(request => (
                      <div
                        key={request._id}
                        className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {request.projectId?.title || 'Project'}
                            </h3>
                            <p className="text-slate-600 text-sm mt-1">
                              Role requested:{' '}
                              <span className="font-semibold capitalize">
                                {request.role}
                              </span>
                            </p>
                          </div>
                          <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                            ⏳ Pending
                          </div>
                        </div>

                        {request.message && (
                          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-sm text-slate-600 mb-2 font-semibold">
                              Your message:
                            </p>
                            <p className="text-slate-700 text-sm leading-relaxed">
                              {request.message}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-slate-500">
                          Sent on {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Accepted Requests */}
            {requests.filter(r => r.status === 'accepted').length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Accepted
                </h2>
                <div className="space-y-4">
                  {requests
                    .filter(r => r.status === 'accepted')
                    .map(request => (
                      <div
                        key={request._id}
                        className="bg-white rounded-xl border border-green-200 p-6 bg-green-50"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {request.projectId?.title || 'Project'}
                            </h3>
                            <p className="text-slate-600 text-sm mt-1">
                              Role:{' '}
                              <span className="font-semibold capitalize">
                                {request.role}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            <CheckCircle size={14} />
                            Accepted
                          </div>
                        </div>

                        {request.message && (
                          <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
                            <p className="text-sm text-slate-600 mb-2 font-semibold">
                              Your message:
                            </p>
                            <p className="text-slate-700 text-sm">
                              {request.message}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-slate-500">
                          Accepted on {new Date(request.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Rejected Requests */}
            {requests.filter(r => r.status === 'rejected').length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Rejected
                </h2>
                <div className="space-y-4">
                  {requests
                    .filter(r => r.status === 'rejected')
                    .map(request => (
                      <div
                        key={request._id}
                        className="bg-white rounded-xl border border-red-200 p-6 bg-red-50"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {request.projectId?.title || 'Project'}
                            </h3>
                            <p className="text-slate-600 text-sm mt-1">
                              Role:{' '}
                              <span className="font-semibold capitalize">
                                {request.role}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            <XCircle size={14} />
                            Rejected
                          </div>
                        </div>

                        {request.message && (
                          <div className="mb-4 p-4 bg-white rounded-lg border border-red-200">
                            <p className="text-sm text-slate-600 mb-2 font-semibold">
                              Your message:
                            </p>
                            <p className="text-slate-700 text-sm">
                              {request.message}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-slate-500">
                          Rejected on {new Date(request.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MyRequestsPage