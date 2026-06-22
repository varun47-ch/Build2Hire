import { useState } from 'react'
import { Check, X, Loader, AlertCircle, User, Mail } from 'lucide-react'

const JoinRequestCard = ({ request, onAccept, onReject, isLoading }) => {
  const [error, setError] = useState(null)

  const handleAccept = async () => {
    setError(null)
    const success = await onAccept(request._id)
    if (!success) {
      setError('Failed to accept request')
    }
  }

  const handleReject = async () => {
    setError(null)
    const success = await onReject(request._id)
    if (!success) {
      setError('Failed to reject request')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}

      {/* User Info */}
      <div className="mb-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{request.requestedBy.name}</h3>
            <div className="flex items-center gap-2 text-slate-600 text-sm mt-1">
              <Mail size={14} />
              <span>{request.requestedBy.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {request.message && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-700">
            <span className="font-semibold block mb-1">Message:</span>
            {request.message}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-slate-500 mb-4">
        Requested on {new Date(request.createdAt).toLocaleDateString()}
      </div>

      {/* Status */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm font-medium text-yellow-900">
          Status: <span className="capitalize">{request.status}</span>
        </p>
      </div>

      {/* Actions */}
      {request.status === 'pending' && (
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={handleReject}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {isLoading ? <Loader size={16} className="animate-spin" /> : <X size={16} />}
            Reject
          </button>
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {isLoading ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
            Accept
          </button>
        </div>
      )}

      {request.status !== 'pending' && (
        <div className={`p-3 rounded-lg text-center font-medium text-sm ${
          request.status === 'accepted'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {request.status === 'accepted' ? '✓ Request Accepted' : '✗ Request Rejected'}
        </div>
      )}
    </div>
  )
}

export default JoinRequestCard