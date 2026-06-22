import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { joinRequestAPI, projectAPI } from '../services/api'
import { ArrowLeft, AlertCircle, Loader, MessageCircle } from 'lucide-react'
import JoinRequestCard from '../components/JoinRequestCard'

const ProjectRequestsPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [requests, setRequests] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [projectId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const projectRes = await projectAPI.getById(projectId)
      setProject(projectRes.data.data)

      if (projectRes.data.data.createdBy._id !== user._id) {
        setError('Only project head can view requests')
        setLoading(false)
        return
      }

      const requestsRes = await joinRequestAPI.getProjectRequests(projectId)
      setRequests(requestsRes.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId) => {
    setActionLoading(true)
    try {
      const response = await joinRequestAPI.accept(projectId, requestId)
      if (response.data.success) {
        setRequests(prev =>
          prev.map(req =>
            req._id === requestId ? { ...req, status: 'approved' } : req
          )
        )
        return true
      }
    } catch (err) {
      return false
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (requestId) => {
    setActionLoading(true)
    try {
      const response = await joinRequestAPI.reject(projectId, requestId)
      if (response.data.success) {
        setRequests(prev =>
          prev.map(req =>
            req._id === requestId ? { ...req, status: 'rejected' } : req
          )
        )
        return true
      }
    } catch (err) {
      return false
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <AlertCircle size={40} className="text-red-600 mx-auto mb-4" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={32} className="text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Join Requests</h1>
              <p className="text-slate-600">for "{project?.title}"</p>
            </div>
          </div>
        </div>

        {requests.length > 0 ? (
          <>
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Pending ({requests.filter(r => r.status === 'pending').length})
                </h2>
                <div className="space-y-4">
                  {requests
                    .filter(r => r.status === 'pending')
                    .map(request => (
                      <JoinRequestCard
                        key={request._id}
                        request={request}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        isLoading={actionLoading}
                      />
                    ))}
                </div>
              </div>
            )}

            {requests.filter(r => r.status !== 'pending').length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Processed ({requests.filter(r => r.status !== 'pending').length})
                </h2>
                <div className="space-y-4">
                  {requests
                    .filter(r => r.status !== 'pending')
                    .map(request => (
                      <JoinRequestCard
                        key={request._id}
                        request={request}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        isLoading={actionLoading}
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <MessageCircle size={40} className="text-slate-400 mx-auto mb-4" />
            <p className="text-lg text-slate-600">No join requests yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectRequestsPage